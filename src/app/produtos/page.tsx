import type { Metadata } from "next";
import Link from "next/link";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import { CartaoProduto } from "@/components/cartao-produto";
import { listarCategorias, listarVitrine } from "@/lib/consultas";
import { limparBusca } from "@/lib/validacao";

export const metadata: Metadata = {
  title: "Vitrine",
  description: "Todas as peças das costureiras do Projeto Girassol.",
};

type Busca = Promise<{ categoria?: string; busca?: string; tipo?: string }>;

export default async function Vitrine({ searchParams }: { searchParams: Busca }) {
  const params = await searchParams;
  const categoria = typeof params.categoria === "string" ? params.categoria : undefined;
  const tipo = params.tipo === "encomenda" || params.tipo === "pronta" ? params.tipo : undefined;
  const busca = limparBusca(typeof params.busca === "string" ? params.busca : "");

  const [categorias, produtos] = await Promise.all([
    listarCategorias(),
    listarVitrine({ categoria, busca, tipo }),
  ]);
  const categoriaAtual = categorias.find((c) => c.slug === categoria);

  const link = (mudanca: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const final = { categoria, busca: busca || undefined, tipo, ...mudanca };
    Object.entries(final).forEach(([k, v]) => v && p.set(k, v));
    const q = p.toString();
    return q ? `/produtos?${q}` : "/produtos";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8 md:pt-14">
      <h1 className="text-4xl font-extrabold md:text-5xl">{categoriaAtual ? categoriaAtual.nome : "A vitrine inteira"}</h1>

      <form action="/produtos" method="get" role="search" className="mt-8 flex max-w-xl gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        {tipo && <input type="hidden" name="tipo" value={tipo} />}
        <label htmlFor="busca" className="sr-only">Buscar peças</label>
        <input id="busca" name="busca" type="search" defaultValue={busca} maxLength={60} placeholder="Vestido, bolsa, jogo de cama..." className="campo" />
        <button type="submit" className="botao botao-principal shrink-0 px-4" aria-label="Buscar">
          <MagnifyingGlassIcon weight="bold" className="size-5" aria-hidden />
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2" aria-label="Filtrar por categoria">
        <Filtro href={link({ categoria: undefined })} ativo={!categoria}>Todas</Filtro>
        {categorias.map((c) => (
          <Filtro key={c.id} href={link({ categoria: c.slug })} ativo={categoria === c.slug}>{c.nome}</Filtro>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Filtrar por tipo">
        <Filtro href={link({ tipo: undefined })} ativo={!tipo}>Qualquer prazo</Filtro>
        <Filtro href={link({ tipo: "pronta" })} ativo={tipo === "pronta"}>Pronta entrega</Filtro>
        <Filtro href={link({ tipo: "encomenda" })} ativo={tipo === "encomenda"}>Sob encomenda</Filtro>
      </div>

      <div className="pesponto mt-8" aria-hidden />

      {produtos.length > 0 ? (
        <>
          <p className="mt-6 text-tinta-suave" aria-live="polite">
            {produtos.length === 1 ? "1 peça encontrada" : `${produtos.length} peças encontradas`}
          </p>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p, i) => (
              <CartaoProduto key={p.id} produto={p} indice={i} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-10 max-w-lg">
          <p className="font-display text-2xl font-bold">Nenhuma peça por aqui ainda.</p>
          <p className="mt-2 text-tinta-suave">
            Tente outra busca ou veja todas as peças. Muitas costureiras também fazem sob encomenda: vale chamar no WhatsApp e perguntar.
          </p>
          <Link href="/produtos" className="botao botao-contorno mt-5">Limpar filtros</Link>
        </div>
      )}
    </div>
  );
}

function Filtro({ href, ativo, children }: { href: string; ativo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={`rounded-full px-4 py-2 text-[0.95rem] font-bold transition-colors ${
        ativo ? "bg-floresta text-sobre-floresta" : "bg-superficie text-tinta-suave hover:text-tinta"
      }`}
    >
      {children}
    </Link>
  );
}
