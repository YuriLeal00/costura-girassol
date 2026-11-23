import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon, PencilSimpleIcon, PlusIcon, SignOutIcon } from "@phosphor-icons/react/dist/ssr";
import { Aviso } from "@/components/campo";
import { sair } from "@/app/(auth)/acoes";
import { alternarProduto } from "./acoes";
import { exigirLogin } from "@/lib/sessao";
import { urlFoto } from "@/lib/env";
import { formatarPreco, primeiroNome, nomeAtelie } from "@/lib/formato";
import type { Produto } from "@/lib/consultas";

export const metadata: Metadata = { title: "Meu ateliê", robots: { index: false } };

export default async function Painel({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const { supabase, perfil } = await exigirLogin();
  const { salvo } = await searchParams;
  const aprovada = perfil.status === "aprovada";

  const [{ data: produtos }, { count: cliques }] = aprovada
    ? await Promise.all([
        supabase
          .from("produtos")
          .select("id, titulo, preco, fotos, ativo, oculto_admin, sob_encomenda")
          .eq("mae_id", perfil.id)
          .order("criado_em", { ascending: false }),
        supabase.from("cliques_whatsapp").select("id", { count: "exact", head: true }).eq("mae_id", perfil.id),
      ])
    : [{ data: [] }, { count: 0 }];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-tinta-suave">Olá, {primeiroNome(perfil.nome)}</p>
          <h1 className="text-4xl font-extrabold md:text-5xl">{nomeAtelie(perfil.nome_loja)}</h1>
        </div>
        <form action={sair}>
          <button className="botao botao-contorno min-h-11">
            <SignOutIcon weight="bold" className="size-5" aria-hidden /> Sair
          </button>
        </form>
      </div>

      <div className="mt-8">
        {perfil.status === "pendente" && (
          <div className="remendo rounded-cartao bg-girassol p-6 text-sobre-girassol md:p-8">
            <h2 className="text-2xl font-bold">Seu cadastro está com a equipe do Projeto Girassol</h2>
            <p className="mt-2 max-w-[60ch]">
              Assim que alguém confirmar sua participação, seu ateliê é liberado e você já pode cadastrar peças. Enquanto isso, vale deixar sua apresentação pronta.
            </p>
            <Link href="/painel/perfil" className="botao mt-5 bg-sobre-girassol text-girassol">Escrever minha apresentação</Link>
          </div>
        )}
        {perfil.status === "recusada" && (
          <div className="rounded-cartao border-2 border-erro p-6">
            <h2 className="text-2xl font-bold">Não conseguimos confirmar seu cadastro</h2>
            {perfil.motivo_recusa && <p className="mt-2">Motivo: {perfil.motivo_recusa}</p>}
            <p className="mt-2 text-tinta-suave">Se achar que houve um engano, fale com a coordenação do Projeto Girassol.</p>
          </div>
        )}
        {perfil.status === "suspensa" && (
          <div className="rounded-cartao border-2 border-erro p-6">
            <h2 className="text-2xl font-bold">Seu ateliê está pausado</h2>
            <p className="mt-2 text-tinta-suave">As peças não aparecem na vitrine por enquanto. Fale com a coordenação do Projeto Girassol para entender o motivo.</p>
          </div>
        )}
      </div>

      {aprovada && (
        <>
          {salvo && <div className="mb-6"><Aviso tipo="ok">Peça salva.</Aviso></div>}
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-cartao bg-superficie p-5">
              <dt className="text-tinta-suave">Peças na vitrine</dt>
              <dd className="font-display text-4xl font-bold">{(produtos ?? []).filter((p) => p.ativo && !p.oculto_admin).length}</dd>
            </div>
            <div className="rounded-cartao bg-superficie p-5">
              <dt className="text-tinta-suave">Pedidos de contato</dt>
              <dd className="font-display text-4xl font-bold">{cliques ?? 0}</dd>
            </div>
            <div className="col-span-2 flex flex-col justify-center gap-2 rounded-cartao border border-dashed border-linha p-5 sm:col-span-1">
              <Link href={`/costureiras/${perfil.slug}`} className="font-bold text-floresta underline">Ver meu ateliê na vitrine</Link>
              <Link href="/painel/perfil" className="font-bold text-floresta underline">Editar apresentação e WhatsApp</Link>
            </div>
          </dl>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-3xl font-bold">Minhas peças</h2>
            <Link href="/painel/produtos/novo" className="botao botao-destaque">
              <PlusIcon weight="bold" className="size-5" aria-hidden /> Nova peça
            </Link>
          </div>

          {(produtos ?? []).length === 0 ? (
            <div className="mt-6 rounded-cartao border-2 border-dashed border-linha p-10 text-center">
              <p className="font-display text-2xl font-bold">Sua vitrine está vazia</p>
              <p className="mt-2 text-tinta-suave">Tire umas fotos com boa luz, de dia, perto de uma janela. Depois é só tocar em Nova peça.</p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-3">
              {(produtos as Pick<Produto, "id" | "titulo" | "preco" | "fotos" | "ativo" | "oculto_admin" | "sob_encomenda">[]).map((p) => (
                <li key={p.id} className="flex items-center gap-4 rounded-cartao bg-superficie p-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-campo bg-superficie-forte">
                    <Image src={urlFoto(p.fotos[0])} alt="" fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold">{p.titulo}</p>
                    <p className="text-tinta-suave">{formatarPreco(p.preco)}</p>
                    {p.oculto_admin ? (
                      <p className="text-sm font-bold text-erro">Retirada da vitrine pela equipe</p>
                    ) : !p.ativo ? (
                      <p className="text-sm font-bold text-tinta-suave">Escondida por você</p>
                    ) : null}
                  </div>
                  <form action={alternarProduto}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="ativo" value={String(p.ativo)} />
                    <button className="grid size-11 place-items-center rounded-full hover:bg-superficie-forte" aria-label={p.ativo ? `Esconder ${p.titulo}` : `Mostrar ${p.titulo}`}>
                      {p.ativo ? <EyeIcon weight="bold" className="size-5" aria-hidden /> : <EyeSlashIcon weight="bold" className="size-5" aria-hidden />}
                    </button>
                  </form>
                  <Link href={`/painel/produtos/${p.id}`} className="grid size-11 place-items-center rounded-full hover:bg-superficie-forte" aria-label={`Editar ${p.titulo}`}>
                    <PencilSimpleIcon weight="bold" className="size-5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
