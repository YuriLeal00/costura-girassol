import type { Metadata } from "next";
import Link from "next/link";
import { FormPerfil } from "./form";
import { exigirLogin } from "@/lib/sessao";
import { formatarWhatsapp } from "@/lib/formato";

export const metadata: Metadata = { title: "Meu perfil", robots: { index: false } };

export default async function Perfil() {
  const { perfil } = await exigirLogin();
  return (
    <div className="mx-auto max-w-2xl px-4 pt-10 md:px-8">
      <Link href="/painel" className="font-bold text-tinta-suave hover:text-tinta">Voltar para o painel</Link>
      <h1 className="mt-4 text-4xl font-extrabold">Seu ateliê</h1>
      <FormPerfil
        inicial={{
          nome_loja: perfil.nome_loja,
          whatsapp: formatarWhatsapp(perfil.whatsapp),
          bairro: perfil.bairro,
          bio: perfil.bio ?? "",
        }}
      />
    </div>
  );
}
