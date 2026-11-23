import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, WhatsappLogoIcon } from "@phosphor-icons/react/dist/ssr";
import { CartaoProduto } from "@/components/cartao-produto";
import { Retalho } from "@/components/tecidos";
import { listarCategorias, listarVitrine } from "@/lib/consultas";
import { urlFoto } from "@/lib/env";

const passos = [
  {
    marca: "0 cm",
    titulo: "Escolha a peça",
    texto: "Muitas peças são feitas sob encomenda, no tamanho e na cor que você pedir.",
  },
  {
    marca: "50 cm",
    titulo: "Fale com quem costura",
    texto: "O botão de encomenda abre uma conversa no WhatsApp com a mãe que fez a peça.",
  },
  {
    marca: "1 m",
    titulo: "Combine do seu jeito",
    texto: "Preço final, prazo, pagamento e entrega ficam entre vocês. O site não cobra comissão.",
  },
];

export default async function Inicio() {
  const [produtos, categorias] = await Promise.all([listarVitrine({ limite: 8 }), listarCategorias()]);
  const fotosHero = produtos.slice(0, 3);

  return (
    <>
      {/* Hero: texto a esquerda, colcha de retalhos a direita */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:px-8 md:pt-16 lg:gap-16">
        <div className="surgir">
          <h1 className="text-[2.6rem] font-extrabold sm:text-5xl lg:text-6xl">
            Costura feita em casa, entre um cuidado e outro.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg text-tinta-suave md:text-xl">
            Roupas, bolsas e consertos feitos por mães de crianças com TEA do Projeto Girassol. A encomenda é direto com ela.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/produtos" className="botao botao-principal">
              Ver a vitrine <ArrowRightIcon weight="bold" className="size-5" aria-hidden />
            </Link>
            <Link href="/cadastro" className="botao botao-contorno">
              Quero vender aqui
            </Link>
          </div>
        </div>

        <div className="surgir grid h-[340px] grid-cols-6 grid-rows-6 gap-3 sm:h-[440px] lg:h-[520px]" style={{ "--i": 2 } as React.CSSProperties}>
          {fotosHero[0] ? (
            <FotoRetalho caminho={fotosHero[0].fotos[0]} alt={fotosHero[0].titulo} className="col-span-4 row-span-4" prioridade />
          ) : (
            <Retalho padrao="vichy" className="col-span-4 row-span-4" />
          )}
          <Retalho padrao="listra" className="col-span-2 row-span-3 grid place-items-end p-4">
            <span className="etiqueta bg-papel text-tinta">Sob medida</span>
          </Retalho>
          {fotosHero[1] ? (
            <FotoRetalho caminho={fotosHero[1].fotos[0]} alt={fotosHero[1].titulo} className="col-span-2 row-span-3" />
          ) : (
            <Retalho padrao="poa" className="col-span-2 row-span-3" />
          )}
          {fotosHero[2] ? (
            <FotoRetalho caminho={fotosHero[2].fotos[0]} alt={fotosHero[2].titulo} className="col-span-4 row-span-2" />
          ) : (
            <Retalho padrao="listra" className="col-span-4 row-span-2" />
          )}
        </div>
      </section>

      {/* Como funciona: fita metrica */}
      <section aria-labelledby="como-funciona" className="bg-superficie py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 id="como-funciona" className="max-w-xl text-3xl font-bold md:text-4xl">
            Do clique à peça pronta, sem intermediário.
          </h2>
          <div className="relative mt-12">
            <div
              aria-hidden
              className="absolute left-0 right-0 top-0 hidden h-9 rounded-md bg-girassol md:block"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(90deg, var(--sobre-girassol) 0 1.5px, transparent 1.5px 12px), repeating-linear-gradient(90deg, var(--sobre-girassol) 0 2px, transparent 2px 60px)",
                backgroundSize: "100% 9px, 100% 18px",
                backgroundRepeat: "no-repeat",
              }}
            />
            <ol className="grid gap-8 md:grid-cols-3 md:gap-10 md:pt-14">
              {passos.map((p, i) => (
                <li key={p.titulo} className="surgir border-l-2 border-dashed border-floresta/40 pl-5 md:border-l-0 md:pl-0" style={{ "--i": i } as React.CSSProperties}>
                  <span className="font-display text-sm font-bold text-floresta">{p.marca}</span>
                  <h3 className="mt-1 text-2xl font-bold">{p.titulo}</h3>
                  <p className="mt-2 max-w-[34ch] text-tinta-suave">{p.texto}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Categorias em pilulas */}
      <section aria-labelledby="categorias" className="mx-auto max-w-7xl px-4 pt-16 md:px-8">
        <h2 id="categorias" className="text-2xl font-bold">O que elas costuram</h2>
        <div className="-mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:px-0">
          {categorias.map((c) => (
            <Link
              key={c.id}
              href={`/produtos?categoria=${c.slug}`}
              className="snap-start whitespace-nowrap rounded-full border-[1.5px] border-dashed border-linha px-5 py-3 font-bold transition-colors hover:border-floresta hover:bg-floresta hover:text-sobre-floresta"
            >
              {c.nome}
            </Link>
          ))}
        </div>
      </section>

      {/* Pecas recentes */}
      <section aria-labelledby="recentes" className="mx-auto max-w-7xl px-4 pt-14 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 id="recentes" className="text-3xl font-bold md:text-4xl">Saiu da máquina agora</h2>
          {produtos.length > 0 && (
            <Link href="/produtos" className="hidden font-bold text-floresta underline-offset-4 hover:underline sm:inline">
              Ver todas as peças
            </Link>
          )}
        </div>
        {produtos.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {produtos.map((p, i) => (
              <CartaoProduto key={p.id} produto={p} indice={i} />
            ))}
          </div>
        ) : (
          <Retalho padrao="poa" className="mt-8 grid min-h-56 place-items-center p-8 text-center text-tinta">
            <div className="rounded-cartao bg-papel/95 px-6 py-5">
              <p className="font-display text-xl font-bold">As primeiras peças estão sendo costuradas.</p>
              <p className="mt-1 text-tinta-suave">Volte em alguns dias para ver a vitrine cheia.</p>
            </div>
          </Retalho>
        )}
      </section>

      {/* Faixa para as costureiras */}
      <section className="mx-auto mt-20 max-w-7xl px-4 md:px-8">
        <div className="remendo grid gap-8 rounded-cartao bg-floresta px-6 py-12 text-sobre-floresta md:grid-cols-[1.3fr_1fr] md:items-center md:px-14">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Você costura e participa do Projeto Girassol?</h2>
            <p className="mt-4 max-w-[52ch] opacity-90">
              Monte seu ateliê aqui de graça. Você cadastra as peças pelo celular, e quem compra chama você no WhatsApp.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <Link href="/cadastro" className="botao botao-destaque">
              Quero vender aqui
            </Link>
            <p className="flex items-center gap-2 text-sm opacity-85">
              <WhatsappLogoIcon weight="bold" className="size-5" aria-hidden /> As conversas acontecem no seu WhatsApp
            </p>
          </div>
        </div>
      </section>

      {/* Por que o site existe */}
      <section className="mx-auto mt-24 max-w-4xl px-4 text-center md:px-8">
        <p className="font-display text-2xl font-bold leading-snug md:text-[2rem]">
          Muitas mães de crianças com TEA deixaram o emprego para acompanhar terapias, escola e crises. A agulha continuou com elas.
        </p>
        <Link href="/sobre" className="mt-6 inline-flex items-center gap-2 font-bold text-floresta underline-offset-4 hover:underline">
          Conheça o projeto <ArrowRightIcon weight="bold" className="size-4" aria-hidden />
        </Link>
      </section>
    </>
  );
}

function FotoRetalho({
  caminho,
  alt,
  className,
  prioridade,
}: {
  caminho: string;
  alt: string;
  className: string;
  prioridade?: boolean;
}) {
  return (
    <div className={`remendo relative overflow-hidden rounded-cartao bg-superficie text-papel ${className}`}>
      <Image src={urlFoto(caminho)} alt={alt} fill priority={prioridade} sizes="(min-width: 768px) 30vw, 60vw" className="object-cover" />
    </div>
  );
}
