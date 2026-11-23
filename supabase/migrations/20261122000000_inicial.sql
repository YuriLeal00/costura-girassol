-- Costura Girassol: esquema inicial
-- Nenhum dado de saude e guardado aqui. A validacao das maes e feita pelo Projeto Girassol, fora do site.

create extension if not exists unaccent with schema extensions;

-- Tipos ---------------------------------------------------------------
create type public.papel_usuario as enum ('mae', 'admin');
create type public.status_cadastro as enum ('pendente', 'aprovada', 'recusada', 'suspensa');

-- Perfis --------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  papel public.papel_usuario not null default 'mae',
  status public.status_cadastro not null default 'pendente',
  nome text not null check (char_length(nome) between 3 and 120),
  nome_loja text not null check (char_length(nome_loja) between 2 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 90),
  whatsapp text not null check (whatsapp ~ '^55[0-9]{10,11}$'),
  bairro text not null check (char_length(bairro) between 2 and 80),
  bio text check (char_length(bio) <= 600),
  foto_url text check (char_length(foto_url) <= 500 and foto_url ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.webp$'),
  referencia_girassol text check (char_length(referencia_girassol) <= 200),
  motivo_recusa text check (char_length(motivo_recusa) <= 500),
  aceite_termos_em timestamptz not null,
  aprovada_em timestamptz,
  aprovada_por uuid references auth.users (id),
  criado_em timestamptz not null default now()
);

-- Categorias ----------------------------------------------------------
create table public.categorias (
  id smallint generated always as identity primary key,
  nome text not null unique,
  slug text not null unique,
  ordem smallint not null default 0
);

insert into public.categorias (nome, slug, ordem) values
  ('Roupas infantis', 'roupas-infantis', 1),
  ('Roupas adultas', 'roupas-adultas', 2),
  ('Bolsas e necessaires', 'bolsas-e-necessaires', 3),
  ('Cama, mesa e banho', 'cama-mesa-e-banho', 4),
  ('Acessórios', 'acessorios', 5),
  ('Bonecos e pelúcias', 'bonecos-e-pelucias', 6),
  ('Consertos e ajustes', 'consertos-e-ajustes', 7);

-- Produtos ------------------------------------------------------------
create table public.produtos (
  id uuid primary key default gen_random_uuid(),
  mae_id uuid not null references public.perfis (id) on delete cascade,
  categoria_id smallint not null references public.categorias (id),
  titulo text not null check (char_length(titulo) between 3 and 90),
  descricao text not null check (char_length(descricao) between 10 and 1500),
  preco numeric(10, 2) check (preco is null or (preco > 0 and preco < 100000)),
  sob_encomenda boolean not null default false,
  prazo_dias smallint check (prazo_dias is null or prazo_dias between 1 and 120),
  fotos text[] not null default '{}' check (cardinality(fotos) between 1 and 5),
  ativo boolean not null default true,
  oculto_admin boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index produtos_vitrine_idx on public.produtos (criado_em desc) where ativo and not oculto_admin;
create index produtos_mae_idx on public.produtos (mae_id);

-- Cliques no WhatsApp (metricas de impacto) ---------------------------
create table public.cliques_whatsapp (
  id bigint generated always as identity primary key,
  produto_id uuid references public.produtos (id) on delete set null,
  mae_id uuid not null references public.perfis (id) on delete cascade,
  criado_em timestamptz not null default now()
);

-- Log do admin (trilha de auditoria) ----------------------------------
create table public.log_admin (
  id bigint generated always as identity primary key,
  admin_id uuid not null references auth.users (id),
  acao text not null,
  alvo_tipo text not null,
  alvo_id uuid not null,
  detalhe text,
  criado_em timestamptz not null default now()
);

-- Funcoes auxiliares --------------------------------------------------
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and papel = 'admin' and status = 'aprovada'
  );
$$;

create or replace function public.eh_mae_aprovada()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.perfis
    where id = (select auth.uid()) and status = 'aprovada'
  );
$$;

create or replace function public.mae_esta_aprovada(p_mae uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.perfis where id = p_mae and status = 'aprovada');
$$;

-- Cria o perfil no signup a partir dos metadados do formulario.
-- papel e status NUNCA vem do cliente: sempre 'mae' e 'pendente'.
create or replace function public.criar_perfil_no_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  base_slug text;
  final_slug text;
  n int := 0;
begin
  base_slug := lower(regexp_replace(
    extensions.unaccent(coalesce(new.raw_user_meta_data ->> 'nome_loja', 'atelie')),
    '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from left(base_slug, 60));
  if base_slug = '' then base_slug := 'atelie'; end if;
  final_slug := base_slug;
  while exists (select 1 from public.perfis where slug = final_slug) loop
    n := n + 1;
    final_slug := base_slug || '-' || n;
  end loop;

  insert into public.perfis (id, nome, nome_loja, slug, whatsapp, bairro, referencia_girassol, aceite_termos_em)
  values (
    new.id,
    new.raw_user_meta_data ->> 'nome',
    new.raw_user_meta_data ->> 'nome_loja',
    final_slug,
    new.raw_user_meta_data ->> 'whatsapp',
    new.raw_user_meta_data ->> 'bairro',
    nullif(new.raw_user_meta_data ->> 'referencia_girassol', ''),
    now()
  );
  return new;
end;
$$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil_no_signup();

-- Impede que quem nao e admin altere campos de controle do proprio perfil.
create or replace function public.proteger_campos_perfil()
returns trigger
language plpgsql
security invoker -- INVOKER de proposito: com DEFINER, current_user vira postgres e libera todo mundo (achado do pentest P1/P2)
set search_path = ''
as $$
begin
  if not public.eh_admin() and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    if new.papel is distinct from old.papel
       or new.status is distinct from old.status
       or new.aprovada_em is distinct from old.aprovada_em
       or new.aprovada_por is distinct from old.aprovada_por
       or new.motivo_recusa is distinct from old.motivo_recusa
       or new.slug is distinct from old.slug
       or new.aceite_termos_em is distinct from old.aceite_termos_em
       or new.id is distinct from old.id then
      raise exception 'Sem permissão para alterar este campo' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

create trigger proteger_perfil
  before update on public.perfis
  for each row execute function public.proteger_campos_perfil();

-- Mae nao pode mexer em oculto_admin nem trocar o dono do produto.
create or replace function public.proteger_campos_produto()
returns trigger
language plpgsql
security invoker -- ver comentario em proteger_campos_perfil
set search_path = ''
as $$
begin
  if not public.eh_admin() and current_user not in ('postgres', 'service_role', 'supabase_admin') then
    if tg_op = 'INSERT' then
      new.oculto_admin := false;
    elsif new.oculto_admin is distinct from old.oculto_admin
       or new.mae_id is distinct from old.mae_id then
      raise exception 'Sem permissão para alterar este campo' using errcode = '42501';
    end if;
  end if;
  -- Toda foto precisa estar na pasta da dona do produto, no formato que o site gera.
  -- Barra quem chama a API direto tentando apontar para arquivo de outra pessoa ou de outro lugar.
  if exists (
    select 1 from unnest(new.fotos) f
    where f !~ ('^' || new.mae_id::text || '/[0-9a-f-]{36}\.webp$')
  ) then
    raise exception 'Caminho de foto inválido' using errcode = '22023';
  end if;
  new.atualizado_em := now();
  return new;
end;
$$;

create trigger proteger_produto
  before insert or update on public.produtos
  for each row execute function public.proteger_campos_produto();

-- Registro de clique sem expor a tabela para escrita direta.
-- Devolve o WhatsApp da mae do produto e registra o clique.
-- O numero nunca vai no HTML da vitrine; so sai aqui, um produto por vez.
create or replace function public.registrar_clique(p_produto uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mae uuid;
  v_whats text;
begin
  select p.mae_id, m.whatsapp into v_mae, v_whats
  from public.produtos p
  join public.perfis m on m.id = p.mae_id
  where p.id = p_produto and p.ativo and not p.oculto_admin and m.status = 'aprovada';
  if v_mae is null then return null; end if;
  insert into public.cliques_whatsapp (produto_id, mae_id) values (p_produto, v_mae);
  return v_whats;
end;
$$;

-- RLS -----------------------------------------------------------------
alter table public.perfis enable row level security;
alter table public.categorias enable row level security;
alter table public.produtos enable row level security;
alter table public.cliques_whatsapp enable row level security;
alter table public.log_admin enable row level security;

-- Perfis: o publico nao le a tabela direto (usa a view vitrine_maes).
create policy "mae le o proprio perfil" on public.perfis
  for select to authenticated using (id = (select auth.uid()) or public.eh_admin());
create policy "mae edita o proprio perfil" on public.perfis
  for update to authenticated using (id = (select auth.uid()) or public.eh_admin())
  with check (id = (select auth.uid()) or public.eh_admin());

-- Categorias: leitura publica, escrita so admin.
create policy "categorias publicas" on public.categorias for select using (true);
create policy "admin gerencia categorias" on public.categorias
  for all to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- Produtos
create policy "vitrine publica" on public.produtos
  for select using (
    (ativo and not oculto_admin and public.mae_esta_aprovada(mae_id))
    or mae_id = (select auth.uid())
    or public.eh_admin()
  );
create policy "mae aprovada cria produto" on public.produtos
  for insert to authenticated
  with check (mae_id = (select auth.uid()) and public.eh_mae_aprovada());
create policy "mae aprovada edita produto" on public.produtos
  for update to authenticated
  using ((mae_id = (select auth.uid()) and public.eh_mae_aprovada()) or public.eh_admin())
  with check ((mae_id = (select auth.uid()) and public.eh_mae_aprovada()) or public.eh_admin());
create policy "mae apaga produto" on public.produtos
  for delete to authenticated
  using (mae_id = (select auth.uid()) or public.eh_admin());

-- Cliques: so leitura da propria mae ou admin. Escrita apenas via registrar_clique().
create policy "le cliques" on public.cliques_whatsapp
  for select to authenticated using (mae_id = (select auth.uid()) or public.eh_admin());

-- Log: so admin le e escreve, sempre em nome dele mesmo. Ninguem edita nem apaga.
create policy "admin le log" on public.log_admin
  for select to authenticated using (public.eh_admin());
create policy "admin registra log" on public.log_admin
  for insert to authenticated
  with check (public.eh_admin() and admin_id = (select auth.uid()));

-- View publica das maes aprovadas, so com campos publicos.
create view public.vitrine_maes
with (security_barrier = true)
as
  select id, nome, nome_loja, slug, bairro, bio, foto_url, aprovada_em
  from public.perfis
  where status = 'aprovada' and papel = 'mae';

-- Permissoes de tabela ------------------------------------------------
revoke all on public.perfis, public.produtos, public.cliques_whatsapp, public.log_admin, public.categorias from anon;
revoke insert, delete on public.perfis from authenticated;
revoke insert, update, delete on public.cliques_whatsapp from authenticated;
revoke update, delete on public.log_admin from authenticated;
grant select on public.categorias to anon, authenticated;
grant select on public.produtos to anon;
grant select on public.vitrine_maes to anon, authenticated;
grant execute on function public.registrar_clique(uuid) to anon, authenticated;
revoke execute on function public.criar_perfil_no_signup() from anon, authenticated, public;
revoke execute on function public.proteger_campos_perfil() from anon, authenticated, public;
revoke execute on function public.proteger_campos_produto() from anon, authenticated, public;

-- Storage: fotos dos produtos ------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('produtos', 'produtos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Cada mae so escreve dentro da pasta com o proprio id: produtos/<uid>/arquivo.webp
create policy "mae aprovada envia foto" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'produtos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and public.eh_mae_aprovada()
  );
create policy "mae apaga a propria foto" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'produtos'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.eh_admin())
  );
