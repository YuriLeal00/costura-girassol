import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ClockIcon, MapPinIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { Galeria } from "@/components/galeria";
import { obterProdutoPublico } from "@/lib/consultas";
import { urlFoto } from "@/lib/env";
import { formatarPreco, primeiroNome, nomeAtelie } from "@/lib/formato";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const produto = await obterProdutoPublico((await params).id);
  if (!produto) return { title: "Peça não encontrada" };
  return {
    title: produto.titulo,
    description: produto.descricao.slice(0, 150),
    openGraph: { images: [urlFoto(produto.fotos[0])] },
  };
}

export default async function PaginaProduto({ params }: { params: Params }) {
  const produto = await obterProdutoPublico((await params).id);
  if (!produto || !produto.mae) notFound();
  const mae = produto.mae;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 md:px-8">
      <Link href="/produtos" className="inline-flex items-center gap-2 font-bold text-tinta-suave hover:text-tinta">
        <ArrowLeftIcon weight="bold" className="size-4" aria-hidden /> Voltar para a vitrine
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.15fr_1fr] lg:gap-16">
        <Galeria fotos={produto.fotos.map(urlFoto)} titulo={produto.titulo} />

        <div className="md:sticky md:top-28 md:self-start">
          {produto.categoria && (
            <Link href={`/produtos?categoria=${produto.categoria.slug}`} className="text-sm font-bold text-floresta hover:underline">
              {produto.categoria.nome}
            </Link>
          )}
          <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">{produto.titulo}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="etiqueta bg-girassol text-lg text-sobre-girassol">{formatarPreco(produto.preco)}</span>
            {produto.sob_encomenda && <span className="etiqueta bg-superficie text-floresta">Sob encomenda</span>}
          </div>

          {produto.prazo_dias && (
            <p className="mt-4 flex items-center gap-2 text-tinta-suave">
              <ClockIcon weight="bold" className="size-5" aria-hidden />
              Fica pronta em cerca de {produto.prazo_dias} {produto.prazo_dias === 1 ? "dia" : "dias"}
            </p>
          )}

          <p className="mt-6 whitespace-pre-line">{produto.descricao}</p>

          {/* rel=nofollow e <a> comum: evita que robos e prefetch contem cliques falsos */}
          <a href={`/encomendar/${produto.id}`} rel="nofollow noopener" target="_blank" className="botao botao-destaque mt-8 w-full text-lg sm:w-auto">
            <WhatsappLogoIcon weight="fill" className="size-6" aria-hidden />
            Encomendar com {primeiroNome(mae.nome)}
          </a>
          <p className="ajuda">Abre o WhatsApp com uma mensagem pronta. Preço final, prazo e entrega vocês combinam na conversa.</p>

          <Link href={`/costureiras/${mae.slug}`} className="remendo mt-10 block rounded-cartao bg-superficie p-6 text-tinta transition-colors hover:bg-superficie-forte">
            <p className="text-sm text-tinta-suave">Quem costurou</p>
            <p className="mt-1 font-display text-2xl font-bold">{nomeAtelie(mae.nome_loja)}</p>
            <p className="mt-1 flex items-center gap-1.5 text-tinta-suave">
              <MapPinIcon weight="bold" className="size-4" aria-hidden /> {mae.bairro}
            </p>
            <p className="mt-3 font-bold text-floresta">Ver todas as peças dela</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
