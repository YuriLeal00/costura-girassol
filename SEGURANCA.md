# Relatório de segurança e pentest

Projeto: Costura Girassol
Data: 22 de novembro de 2026
Ambiente testado: Supabase local (Docker) + Next.js 16 em modo de desenvolvimento, em `localhost`.
Escopo: só o próprio projeto. Nenhum sistema de terceiros foi testado.

## Como o site se protege

O site não tem chave secreta nenhuma. O navegador e o servidor usam a mesma chave pública do Supabase, e o que cada pessoa pode fazer é decidido dentro do banco, por políticas de Row Level Security (RLS) e por gatilhos. Assim, mesmo quem ignora o site e chama a API do Supabase direto continua barrado.

| Camada | O que faz |
|---|---|
| RLS em todas as tabelas | Visitante só lê peças ativas de mães aprovadas. Mãe só mexe nas próprias peças e no próprio perfil. Só a admin vê cadastros, log e cliques de todo mundo. |
| Gatilho `proteger_campos_perfil` | Ninguém além da admin muda `papel`, `status`, aprovação ou `slug`. |
| Gatilho `proteger_campos_produto` | Mãe não mexe em `oculto_admin`, não troca o dono da peça e só usa fotos da própria pasta. |
| View `vitrine_maes` | Expõe só nome, ateliê, bairro e bio. WhatsApp e dados internos ficam de fora. |
| RPC `registrar_clique` | Única forma de obter o WhatsApp de uma mãe: um produto por vez, e só de produto ativo de mãe aprovada. |
| Storage | Bucket aceita só JPEG, PNG e WEBP até 5 MB. Cada mãe aprovada só grava na pasta com o próprio id. |
| Next.js | Zod em todas as Server Actions, sessão validada no servidor (`getUser`), CSP com nonce, HSTS, `X-Frame-Options: DENY`, `nosniff`, sem `X-Powered-By`. |
| Formulários | Campo isca contra robôs, limite de tentativas por IP em cadastro, login, recuperação de senha e encomenda. Mensagem de login igual para e-mail inexistente e senha errada. |
| Fotos | Recomprimidas no celular para WEBP antes do envio, o que apaga EXIF e localização GPS. |
| LGPD | Nenhum dado de saúde é guardado: nada de laudo, CID ou dados das crianças. |

## Teste automatizado (`scripts/pentest.mjs`)

O script ataca o site como um usuário mal-intencionado, usando só a chave pública e contas comuns. Resultado final: **40 de 40 testes passaram**.

| Grupo | Testes | O que tenta |
|---|---|---|
| A1 a A8 | Visitante anônimo | Ler perfis, log, cliques, peças ocultas. Criar peça, gravar clique, enviar arquivo. |
| P1 a P6 | Mãe pendente | Se aprovar, virar admin, publicar peça, enviar foto, ler outros perfis, escrever no log. |
| M1 a M14 | Mãe aprovada | Virar admin, transferir peça, editar e apagar peça de outra mãe (IDOR), gravar na pasta alheia, enviar SVG, HTML e arquivo gigante, usar foto de outra pasta, path traversal, URL arbitrária no perfil, XSS na bio. |
| W1 a W12 | Aplicação web | Rotas protegidas sem login, CSP, clickjacking, HSTS, injeção na busca, open redirect, vazamento de WhatsApp no HTML, limite de requisições, XSS armazenado. |

### Rodada em produção (https://costura-girassol.vercel.app)

Rodei os grupos A e W contra o site publicado: **18 de 19 passaram**. Os grupos P e M precisam de contas de teste em produção e não foram repetidos lá. O banco de produção foi criado com o mesmo SQL que passou 40/40 no ambiente local, e conferi no painel que os gatilhos estão como `SECURITY INVOKER`.

O que falhou foi o **W11** (limite de requisições em `/encomendar`), e já era esperado: o limitador fica na memória de cada instância do servidor. Na Vercel, as requisições se espalham entre várias instâncias e o contador não acumula. No ambiente local, com uma instância só, ele passa. Ver "Riscos aceitos" e a recomendação de usar o Firewall da Vercel.

## Vulnerabilidades encontradas e corrigidas

### 1. Escalada de privilégio: qualquer conta podia virar admin (crítica)

- **Como apareceu:** os testes P1 e P2 falharam na primeira rodada. A mãe pendente mudou o próprio `status` para `aprovada` e o `papel` para `admin`.
- **Causa:** os gatilhos de proteção foram criados como `SECURITY DEFINER`. Nesse modo, `current_user` dentro da função vira `postgres` (o dono), e a regra que liberava o usuário `postgres` liberava todo mundo.
- **Efeito em cascata:** com a conta virando admin, também falharam P4 a P6, M1, M3, M4, M9 e M10.
- **Correção:** os dois gatilhos passaram a `SECURITY INVOKER`, e agora `current_user` é `authenticated` numa chamada pela API. O banco foi recriado do zero e todos os testes passaram.
- **Lição:** um teste de RLS que só checa "deu erro?" não basta. Foi o teste de escalada de privilégio que pegou o problema.

### 2. Caminho de foto arbitrário pela API direta (média)

- **Como apareceu:** revisão manual do código. A validação do caminho da foto existia só no Zod, dentro do site.
- **Risco:** uma mãe aprovada, chamando a API direto, poderia apontar a foto do produto para arquivos de outras mães ou de fora do bucket (`../`).
- **Correção:** o gatilho do produto exige que cada foto siga o formato `<id da mãe>/<uuid>.webp`. Os testes M11 e M12 cobrem isso.

### 3. `foto_url` aceitava qualquer texto (baixa)

- **Risco:** a coluna aceitava `javascript:...`. Hoje ela não aparece na tela, mas viraria XSS no dia em que alguém a usasse num link.
- **Correção:** restrição `CHECK` no banco. O teste M13 cobre isso.

### 4. CSP bloqueando estilos do próprio Next (funcional)

- O nonce em `style-src` fazia o navegador ignorar o `unsafe-inline`, e os estilos que o Next injeta eram bloqueados.
- **Decisão:** `style-src 'self' 'unsafe-inline'`. A proteção que importa contra XSS, `script-src` com nonce e `strict-dynamic`, continua.

## Riscos aceitos (e por quê)

| Risco | Gravidade | Por que foi aceito |
|---|---|---|
| Alguém pode chamar o RPC `registrar_clique` direto para cada produto e juntar os números de WhatsApp. | Baixa | O número é de contato comercial e aparece para qualquer cliente que toca em Encomendar. O RPC entrega um produto por vez. Melhoria futura: mover a chamada para uma função no servidor com chave secreta. |
| A mesma chamada pode inflar a contagem de cliques. | Baixa | A contagem é só um indicador de impacto, e nenhuma decisão de dinheiro depende dela. |
| O limite de tentativas fica em memória, por instância do servidor, e não segura na Vercel (confirmado pelo W11 em produção). | Baixa | Login e cadastro também passam pelos limites do próprio Supabase Auth. Para `/encomendar`, o pior caso é inflar a contagem de cliques. Correção recomendada: regra de rate limit no Firewall da Vercel para `/encomendar/*`, ou Upstash Redis. |
| Com a confirmação de e-mail desligada, o cadastro diz "já existe conta com esse e-mail". | Baixa | Em produção a confirmação fica ligada, e o Supabase passa a responder igual para e-mail novo e repetido. |
| O cookie de sessão do Supabase não é `HttpOnly`. | Baixa | É o desenho do `@supabase/ssr`. A defesa contra roubo de sessão é a CSP de scripts com nonce, sem nenhum `dangerouslySetInnerHTML` no código. |
| A view `vitrine_maes` roda com as permissões do dono. | Informativa | É de propósito: ela só seleciona colunas públicas de mães aprovadas. O linter do Supabase vai avisar, e o aviso pode ser ignorado. |

## Outras verificações

- `npm audit`: 0 vulnerabilidades.
- Nenhuma chave secreta no código ou no repositório (`.env*` e as credenciais de teste estão no `.gitignore`).
- Nenhum uso de `dangerouslySetInnerHTML`, `eval` ou `innerHTML`.

## Configuração de produção (feita em 22/11/2026)

- Supabase em São Paulo (`sa-east-1`), com o SQL aplicado e conferido: 7 categorias, 13 políticas, bucket de fotos e gatilhos `SECURITY INVOKER`.
- Auth: confirmação de e-mail ligada, senha mínima de 8 caracteres com letras e números, login anônimo desligado.
- Site URL `https://costura-girassol.vercel.app` e redirecionamento liberado só para `/auth/confirmar`.
- Vercel: só as três variáveis públicas. Nenhuma chave secreta.

## Pendências

1. **SMTP próprio no Supabase.** Sem ele, o e-mail de confirmação só chega para membros da organização no Supabase, e o cadastro de mães de verdade não funciona.
2. Regra de rate limit no Firewall da Vercel para `/encomendar/*`.
3. Rodar os grupos P e M do pentest em produção com contas de teste temporárias, e apagar as contas depois.
4. Rodar o Security Advisor do Supabase e conferir os avisos contra a tabela de riscos aceitos.

## Como repetir o pentest

```bash
SUPABASE_URL=... SUPABASE_KEY=<chave pública> SITE=http://localhost:3000 \
MAE_EMAIL=... MAE_SENHA=... PENDENTE_EMAIL=... PENDENTE_SENHA=... MAE_SLUG=linha-da-rita \
node scripts/pentest.mjs
```
