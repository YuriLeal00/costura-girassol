# Costura Girassol

Vitrine on-line para mães de crianças com TEA que costuram em casa. É um trabalho da Unifor em parceria com o Projeto Girassol e a prefeitura.

Quem compra vê as peças e encomenda direto com a costureira pelo WhatsApp. As mães se cadastram e só aparecem na vitrine depois que a equipe do Projeto Girassol aprova.

Feito com Next.js 16, Tailwind 4 e Supabase (banco, login e fotos). A hospedagem é na Vercel.

## Rodar no computador

Precisa de Node 20+ e Docker Desktop aberto.

```bash
npm install
npx supabase start -x edge-runtime,logflare,vector,imgproxy
```

Crie o `.env.local` com a URL e a chave pública que o `supabase status` mostra (modelo em `.env.example`).

```bash
SUPABASE_STATUS_ENV="$(npx supabase status -o env)" node scripts/semear-local.mjs
npm run dev
```

O seed cria uma admin, três mães (duas aprovadas, uma pendente) e peças de exemplo. As senhas ficam em `scripts/.credenciais-locais.txt`, que não vai para o git. O Supabase Studio local abre em http://127.0.0.1:54323.

## Publicar

1. Crie um projeto em supabase.com e rode o conteúdo de `supabase/migrations/20261122000000_inicial.sql` no SQL Editor.
2. Em Auth > URL Configuration, coloque a URL do site. Em Auth > Providers > Email, ligue **Confirm email** e senha mínima de 8 caracteres.
3. Na Vercel, importe a pasta e defina `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `NEXT_PUBLIC_SITE_URL`.
4. Crie a conta da coordenação pelo próprio site (Quero vender aqui) e promova a conta a admin no SQL Editor:

```sql
update public.perfis set papel = 'admin', status = 'aprovada', aprovada_em = now()
where id = (select id from auth.users where email = 'email-da-coordenacao@exemplo.com');
```

## Segurança

Veja [SEGURANCA.md](SEGURANCA.md): proteções, resultado do pentest (40/40) e riscos aceitos.

## Onde mexer

| O quê | Arquivo |
|---|---|
| Cores, fontes, botões, pesponto | `src/app/globals.css` |
| Textos da página Sobre | `src/app/sobre/page.tsx` |
| Termos e privacidade | `src/app/termos`, `src/app/privacidade` |
| Banco, regras de acesso | `supabase/migrations/` |
| Proteções HTTP e CSP | `src/proxy.ts`, `next.config.ts` |
