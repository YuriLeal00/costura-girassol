import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CheckIcon, SignOutIcon, WhatsappLogoIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { decidirCadastro, moderarProduto } from "./acoes";
import { sair } from "@/app/(auth)/acoes";
import { exigirAdmin } from "@/lib/sessao";
import { urlFoto } from "@/lib/env";
import { formatarData, formatarWhatsapp, nomeAtelie } from "@/lib/formato";

export const metadata: Metadata = { title: "Administração", robots: { index: false } };

type Aba = "pendentes" | "maes" | "pecas" | "historico";
const abas: { id: Aba; rotulo: string }[] = [
  { id: "pendentes", rotulo: "Cadastros novos" },
  { id: "maes", rotulo: "Costureiras" },
  { id: "pecas", rotulo: "Peças" },
  { id: "historico", rotulo: "Histórico" },
];

type PerfilAdmin = {
  id: string;
  nome: string;
  nome_loja: string;
  slug: string;
  whatsapp: string;
  bairro: string;
  status: string;
  referencia_girassol: string | null;
  motivo_recusa: string | null;
  criado_em: string;
};

export default async function Admin({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const { supabase } = await exigirAdmin();
  const { aba: abaBruta } = await searchParams;
  const aba: Aba = abas.some((a) => a.id === abaBruta) ? (abaBruta as Aba) : "pendentes";

  const [pendentes, aprovadas, pecas, cliques] = await Promise.all([
    supabase.from("perfis").select("id", { count: "exact", head: true }).eq("status", "pendente").eq("papel", "mae"),
    supabase.from("perfis").select("id", { count: "exact", head: true }).eq("status", "aprovada").eq("papel", "mae"),
    supabase.from("produtos").select("id", { count: "exact", head: true }).eq("ativo", true).eq("oculto_admin", false),
    supabase.from("cliques_whatsapp").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-4xl font-extrabold md:text-5xl">Administração</h1>
        <form action={sair}>
          <button className="botao botao-contorno min-h-11">
            <SignOutIcon weight="bold" className="size-5" aria-hidden /> Sair
          </button>
        </form>
      </div>

      <dl className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Esperando aprovação", pendentes.count],
          ["Costureiras ativas", aprovadas.count],
          ["Peças na vitrine", pecas.count],
          ["Contatos pelo WhatsApp", cliques.count],
        ].map(([rotulo, valor], i) => (
          <div key={String(rotulo)} className={`rounded-cartao p-5 ${i === 0 && Number(valor) > 0 ? "bg-girassol text-sobre-girassol" : "bg-superficie"}`}>
            <dt className={i === 0 && Number(valor) > 0 ? "" : "text-tinta-suave"}>{rotulo}</dt>
            <dd className="font-display text-4xl font-bold">{valor ?? 0}</dd>
          </div>
        ))}
      </dl>

      <nav aria-label="Seções da administração" className="mt-10 flex gap-1 overflow-x-auto border-b border-linha">
        {abas.map((a) => (
          <Link
            key={a.id}
            href={`/admin?aba=${a.id}`}
            aria-current={aba === a.id ? "page" : undefined}
            className={`whitespace-nowrap border-b-[3px] px-4 py-3 font-bold ${aba === a.id ? "border-floresta text-tinta" : "border-transparent text-tinta-suave hover:text-tinta"}`}
          >
            {a.rotulo}
          </Link>
        ))}
      </nav>

      <div className="mt-8">
        {aba === "pendentes" && <ListaPerfis status={["pendente"]} />}
        {aba === "maes" && <ListaPerfis status={["aprovada", "suspensa", "recusada"]} />}
        {aba === "pecas" && <ListaPecas />}
        {aba === "historico" && <Historico />}
      </div>
    </div>
  );
}

async function ListaPerfis({ status }: { status: string[] }) {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase
    .from("perfis")
    .select("id, nome, nome_loja, slug, whatsapp, bairro, status, referencia_girassol, motivo_recusa, criado_em")
    .eq("papel", "mae")
    .in("status", status)
    .order("criado_em", { ascending: status[0] === "pendente" });
  const perfis = (data ?? []) as PerfilAdmin[];

  if (perfis.length === 0) {
    return <p className="rounded-cartao border-2 border-dashed border-linha p-8 text-center text-tinta-suave">Nada por aqui agora.</p>;
  }

  return (
    <ul className="grid gap-4">
      {perfis.map((p) => (
        <li key={p.id} className="rounded-cartao border border-linha p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-bold">{p.nome}</p>
              <p className="text-tinta-suave">
                {nomeAtelie(p.nome_loja)}, {p.bairro}. Cadastro em {formatarData(p.criado_em)}.
              </p>
            </div>
            <span className={`etiqueta ${p.status === "aprovada" ? "bg-ok/15 text-ok" : p.status === "pendente" ? "bg-girassol text-sobre-girassol" : "bg-erro/15 text-erro"}`}>
              {p.status}
            </span>
          </div>
          <p className="mt-3">
            <span className="font-bold">Como o Projeto Girassol a conhece: </span>
            {p.referencia_girassol || <span className="text-tinta-suave">não informou</span>}
          </p>
          {p.motivo_recusa && <p className="mt-1 text-tinta-suave">Motivo registrado: {p.motivo_recusa}</p>}
          <a
            href={`https://wa.me/${p.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 font-bold text-floresta underline"
          >
            <WhatsappLogoIcon weight="bold" className="size-5" aria-hidden /> {formatarWhatsapp(p.whatsapp)}
          </a>

          <form action={decidirCadastro} className="mt-5 grid gap-3 md:grid-cols-[1fr_auto_auto] md:items-end">
            <input type="hidden" name="id" value={p.id} />
            <div>
              <label htmlFor={`motivo-${p.id}`} className="rotulo text-sm">Motivo (aparece para ela se recusar ou pausar)</label>
              <input id={`motivo-${p.id}`} name="motivo" maxLength={500} className="campo" />
            </div>
            {p.status === "aprovada" ? (
              <button name="decisao" value="suspender" className="botao border-[1.5px] border-erro text-erro">Pausar ateliê</button>
            ) : (
              <>
                {p.status !== "recusada" && (
                  <button name="decisao" value="recusar" className="botao botao-contorno">
                    <XIcon weight="bold" className="size-5" aria-hidden /> Recusar
                  </button>
                )}
                <button name="decisao" value={p.status === "pendente" ? "aprovar" : "reativar"} className="botao botao-principal">
                  <CheckIcon weight="bold" className="size-5" aria-hidden /> {p.status === "pendente" ? "Aprovar" : "Reativar"}
                </button>
              </>
            )}
          </form>
        </li>
      ))}
    </ul>
  );
}

async function ListaPecas() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase
    .from("produtos")
    .select("id, titulo, fotos, oculto_admin, ativo, mae_id, criado_em")
    .order("criado_em", { ascending: false })
    .limit(100);
  const pecas = data ?? [];
  if (pecas.length === 0) return <p className="text-tinta-suave">Nenhuma peça cadastrada ainda.</p>;

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {pecas.map((p) => (
        <li key={p.id} className="flex items-center gap-4 rounded-cartao bg-superficie p-3">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-campo">
            <Image src={urlFoto((p.fotos as string[])[0])} alt="" fill sizes="64px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/produtos/${p.id}`} className="block truncate font-bold hover:underline">{p.titulo}</Link>
            <p className="text-sm text-tinta-suave">{p.oculto_admin ? "Oculta pela equipe" : p.ativo ? "Na vitrine" : "Escondida pela costureira"}</p>
          </div>
          <form action={moderarProduto}>
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="ocultar" value={String(!p.oculto_admin)} />
            <button className={`botao min-h-10 px-4 text-sm ${p.oculto_admin ? "botao-principal" : "botao-contorno"}`}>
              {p.oculto_admin ? "Mostrar" : "Ocultar"}
            </button>
          </form>
        </li>
      ))}
    </ul>
  );
}

const rotulosAcao: Record<string, string> = {
  aprovar: "Aprovou o cadastro",
  recusar: "Recusou o cadastro",
  suspender: "Pausou o ateliê",
  reativar: "Reativou o ateliê",
  ocultar: "Tirou a peça da vitrine",
  mostrar: "Devolveu a peça à vitrine",
};

async function Historico() {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("log_admin").select("id, acao, alvo_tipo, detalhe, criado_em").order("criado_em", { ascending: false }).limit(100);
  const itens = data ?? [];
  if (itens.length === 0) return <p className="text-tinta-suave">Nenhuma ação registrada ainda.</p>;
  return (
    <ol className="grid gap-2">
      {itens.map((i) => (
        <li key={i.id} className="grid gap-1 rounded-campo bg-superficie px-4 py-3 sm:grid-cols-[10rem_1fr]">
          <span className="text-sm text-tinta-suave">{formatarData(i.criado_em)}</span>
          <span>
            <span className="font-bold">{rotulosAcao[i.acao] ?? i.acao}</span>
            {i.detalhe && <span>: {i.detalhe}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}
