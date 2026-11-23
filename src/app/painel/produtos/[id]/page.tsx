import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormProduto } from "../form-produto";
import { apagarProduto } from "../../acoes";
import { exigirMaeAprovada } from "@/lib/sessao";
import { listarCategorias, type Produto } from "@/lib/consultas";

export const metadata: Metadata = { title: "Editar peça", robots: { index: false } };

export default async function EditarPeca({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const { supabase, user } = await exigirMaeAprovada();
  const [{ data: produto }, categorias] = await Promise.all([
    supabase.from("produtos").select("*").eq("id", id).eq("mae_id", user.id).maybeSingle(),
    listarCategorias(),
  ]);
  if (!produto) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 md:px-8">
      <Link href="/painel" className="font-bold text-tinta-suave hover:text-tinta">Voltar para o painel</Link>
      <h1 className="mt-4 text-4xl font-extrabold">Editar peça</h1>
      <FormProduto maeId={user.id} categorias={categorias} produto={produto as Produto} />

      <details className="mt-12 rounded-cartao border border-erro/40 p-5">
        <summary className="cursor-pointer font-bold text-erro">Apagar esta peça</summary>
        <p className="mt-3 text-tinta-suave">A peça e as fotos saem do site de vez. Se quiser só tirar da vitrine por um tempo, use o botão de esconder no painel.</p>
        <form action={apagarProduto} className="mt-4">
          <input type="hidden" name="id" value={produto.id} />
          <button className="botao border-[1.5px] border-erro text-erro hover:bg-erro hover:text-papel">Apagar de vez</button>
        </form>
      </details>
    </div>
  );
}
