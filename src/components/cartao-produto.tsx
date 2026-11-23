import Image from "next/image";
import Link from "next/link";
import type { ProdutoVitrine } from "@/lib/consultas";
import { urlFoto } from "@/lib/env";
import { formatarPreco, nomeAtelie } from "@/lib/formato";

export function CartaoProduto({ produto, indice = 0 }: { produto: ProdutoVitrine; indice?: number }) {
  return (
    <article className="surgir group relative" style={{ "--i": indice % 8 } as React.CSSProperties}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-cartao bg-superficie">
        <Image
          src={urlFoto(produto.fotos[0])}
          alt={produto.titulo}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-snug">
            <Link href={`/produtos/${produto.id}`} className="after:absolute after:inset-0 after:rounded-cartao">
              {produto.titulo}
            </Link>
          </h3>
          {produto.mae && <p className="truncate text-sm text-tinta-suave">{nomeAtelie(produto.mae.nome_loja)}</p>}
        </div>
        <span className="etiqueta shrink-0 bg-girassol text-sobre-girassol">{formatarPreco(produto.preco)}</span>
      </div>
      {produto.sob_encomenda && <p className="mt-1 text-sm font-bold text-floresta">Feita sob encomenda</p>}
    </article>
  );
}
