import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import { CartaoProduto } from "@/components/cartao-produto";
import { listarVitrine, obterMaePorSlug } from "@/lib/consultas";
import { primeiroNome, nomeAtelie } from "@/lib/formato";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const mae = await obterMaePorSlug((await params).slug);
  return mae ? { title: nomeAtelie(mae.nome_loja), description: mae.bio?.slice(0, 150) } : { title: "Ateliê não encontrado" };
}

export default async function Atelie({ params }: { params: Params }) {
  const mae = await obterMaePorSlug((await params).slug);
  if (!mae) notFound();
  const produtos = await listarVitrine({ maeId: mae.id });

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8 md:pt-14">
      <header className="grid gap-6 md:grid-cols-[auto_1fr] md:items-end md:gap-10">
        <span className="remendo grid size-28 place-items-center rounded-cartao bg-girassol font-display text-6xl font-extrabold text-sobre-girassol md:size-36 md:text-7xl">
          {mae.nome_loja.charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="text-4xl font-extrabold md:text-6xl">{nomeAtelie(mae.nome_loja)}</h1>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-lg text-tinta-suave">
            <span>Costurado por {primeiroNome(mae.nome)}</span>
            <span className="flex items-center gap-1.5">
              <MapPinIcon weight="bold" className="size-5" aria-hidden /> {mae.bairro}
            </span>
          </p>
        </div>
      </header>

      {mae.bio && <p className="mt-8 max-w-[62ch] whitespace-pre-line text-lg">{mae.bio}</p>}

      <div className="pesponto mt-10" aria-hidden />

      {produtos.length > 0 ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {produtos.map((p, i) => (
            <CartaoProduto key={p.id} produto={p} indice={i} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-tinta-suave">{primeiroNome(mae.nome)} ainda está preparando as primeiras peças.</p>
      )}
    </div>
  );
}
