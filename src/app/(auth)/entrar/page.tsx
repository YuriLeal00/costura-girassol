import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { FormEntrar } from "./form";
import { obterSessao } from "@/lib/sessao";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: { searchParams: Promise<{ link?: string }> }) {
  const { perfil } = await obterSessao();
  if (perfil) redirect(perfil.papel === "admin" ? "/admin" : "/painel");
  const { link } = await searchParams;

  return (
    <div className="mx-auto max-w-md px-4 pt-12 md:pt-20">
      <h1 className="text-4xl font-extrabold">Entrar no seu ateliê</h1>
      <p className="mt-3 text-tinta-suave">Use o e-mail e a senha do cadastro.</p>
      <FormEntrar link={link} />
    </div>
  );
}
