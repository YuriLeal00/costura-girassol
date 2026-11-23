# Onde paramos (22/11/2026)

## No ar
- Site: https://costura-girassol.vercel.app (projeto Vercel `yuri-leal1/costura-girassol`)
- Supabase: projeto `costura-girassol`, ref `rvgtxoqhalampsbjbwvw`, em São Paulo
- Pentest: 40/40 no local e 18/19 em produção. O W11 (rate limit em memória) falha na Vercel, como já era esperado. Detalhes em SEGURANCA.md.

## Falta
1. **Conta da coordenação (admin).** Cadastrar pelo site com um e-mail da equipe do Supabase, confirmar e promover com o SQL do README.
2. **SMTP próprio** (por exemplo o Resend). Sem ele, o Supabase só manda e-mail para membros da organização, e as mães não conseguem confirmar o cadastro.
3. Regra de rate limit no Firewall da Vercel para `/encomendar/*`.
4. Revisar os textos `REVISAR` (sobre, termos, privacidade) com o grupo.
5. Fotos reais.
6. Para redeploy depois de mudanças: `npx vercel deploy --prod` dentro da pasta.

## Ambiente local
O Docker Desktop fica em `C:\Users\yurib\AppData\Local\Programs\DockerDesktop`, e shells antigos podem não ter ele no PATH. Para subir o local: `npx supabase start`, depois o seed (ver README).
