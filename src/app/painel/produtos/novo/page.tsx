import type { Metadata } from "next";
import Link from "next/link";
import { FormProduto } from "../form-produto";
import { exigirMaeAprovada } from "@/lib/sessao";
import { listarCategorias } from "@/lib/consultas";

export const metadata: Metadata = { title: "Nova peça", robots: { index: false } };

export default async function NovaPeca() {
  const { user } = await exigirMaeAprovada();
  const categorias = await listarCategorias();
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 md:px-8">
      <Link href="/painel" className="font-bold text-tinta-suave hover:text-tinta">Voltar para o painel</Link>
      <h1 className="mt-4 text-4xl font-extrabold">Nova peça</h1>
      <FormProduto maeId={user.id} categorias={categorias} />
    </div>
  );
}
