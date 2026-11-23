import "server-only";
import { criarClienteServidor } from "@/lib/supabase/server";
import { limparBusca } from "@/lib/validacao";

export type Categoria = { id: number; nome: string; slug: string };

export type MaePublica = {
  id: string;
  nome: string;
  nome_loja: string;
  slug: string;
  bairro: string;
  bio: string | null;
  foto_url: string | null;
  aprovada_em: string | null;
};

export type Produto = {
  id: string;
  mae_id: string;
  categoria_id: number;
  titulo: string;
  descricao: string;
  preco: number | null;
  sob_encomenda: boolean;
  prazo_dias: number | null;
  fotos: string[];
  ativo: boolean;
  oculto_admin: boolean;
  criado_em: string;
};

export type ProdutoVitrine = Produto & { mae: MaePublica | null; categoria: Categoria | null };

const CAMPOS_PRODUTO =
  "id, mae_id, categoria_id, titulo, descricao, preco, sob_encomenda, prazo_dias, fotos, ativo, oculto_admin, criado_em";

export async function listarCategorias() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("categorias").select("id, nome, slug").order("ordem");
  return (data ?? []) as Categoria[];
}

async function anexarMaes(produtos: Produto[]): Promise<ProdutoVitrine[]> {
  if (produtos.length === 0) return [];
  const supabase = await criarClienteServidor();
  const ids = [...new Set(produtos.map((p) => p.mae_id))];
  const [{ data: maes }, categorias] = await Promise.all([
    supabase.from("vitrine_maes").select("*").in("id", ids),
    listarCategorias(),
  ]);
  const porId = new Map((maes ?? []).map((m) => [m.id, m as MaePublica]));
  const catPorId = new Map(categorias.map((c) => [c.id, c]));
  return produtos.map((p) => ({ ...p, mae: porId.get(p.mae_id) ?? null, categoria: catPorId.get(p.categoria_id) ?? null }));
}

export async function listarVitrine(filtros: {
  categoria?: string;
  busca?: string;
  tipo?: string;
  maeId?: string;
  limite?: number;
}) {
  const supabase = await criarClienteServidor();
  let consulta = supabase
    .from("produtos")
    .select(CAMPOS_PRODUTO)
    .eq("ativo", true)
    .eq("oculto_admin", false)
    .order("criado_em", { ascending: false })
    .limit(Math.min(filtros.limite ?? 48, 60));

  if (filtros.categoria) {
    const cats = await listarCategorias();
    const cat = cats.find((c) => c.slug === filtros.categoria);
    if (cat) consulta = consulta.eq("categoria_id", cat.id);
  }
  if (filtros.tipo === "encomenda") consulta = consulta.eq("sob_encomenda", true);
  if (filtros.tipo === "pronta") consulta = consulta.eq("sob_encomenda", false);
  if (filtros.maeId) consulta = consulta.eq("mae_id", filtros.maeId);

  const termo = limparBusca(filtros.busca);
  if (termo) consulta = consulta.or(`titulo.ilike.%${termo}%,descricao.ilike.%${termo}%`);

  const { data } = await consulta;
  // A politica RLS ja esconde produtos de maes nao aprovadas; filtramos de novo por seguranca.
  const comMae = await anexarMaes((data ?? []) as Produto[]);
  return comMae.filter((p) => p.mae !== null);
}

export async function obterProdutoPublico(id: string) {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("produtos")
    .select(CAMPOS_PRODUTO)
    .eq("id", id)
    .eq("ativo", true)
    .eq("oculto_admin", false)
    .maybeSingle();
  if (!data) return null;
  const [produto] = await anexarMaes([data as Produto]);
  return produto.mae ? produto : null;
}

export async function listarMaes() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("vitrine_maes").select("*").order("aprovada_em", { ascending: false });
  return (data ?? []) as MaePublica[];
}

export async function obterMaePorSlug(slug: string) {
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) return null;
  const supabase = await criarClienteServidor();
  const { data } = await supabase.from("vitrine_maes").select("*").eq("slug", slug).maybeSingle();
  return (data as MaePublica | null) ?? null;
}
