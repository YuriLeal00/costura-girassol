import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";

export type Perfil = {
  id: string;
  papel: "mae" | "admin";
  status: "pendente" | "aprovada" | "recusada" | "suspensa";
  nome: string;
  nome_loja: string;
  slug: string;
  whatsapp: string;
  bairro: string;
  bio: string | null;
  foto_url: string | null;
  motivo_recusa: string | null;
};

// getUser() valida o token no servidor do Supabase (nao confia so no cookie).
export const obterSessao = cache(async () => {
  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, perfil: null };

  const { data: perfil } = await supabase
    .from("perfis")
    .select("id, papel, status, nome, nome_loja, slug, whatsapp, bairro, bio, foto_url, motivo_recusa")
    .eq("id", user.id)
    .single<Perfil>();

  return { supabase, user, perfil };
});

export async function exigirLogin() {
  const sessao = await obterSessao();
  if (!sessao.user || !sessao.perfil) redirect("/entrar");
  return sessao as typeof sessao & { user: NonNullable<typeof sessao.user>; perfil: Perfil };
}

export async function exigirMaeAprovada() {
  const sessao = await exigirLogin();
  if (sessao.perfil.status !== "aprovada") redirect("/painel");
  return sessao;
}

export async function exigirAdmin() {
  const sessao = await exigirLogin();
  if (sessao.perfil.papel !== "admin" || sessao.perfil.status !== "aprovada") redirect("/painel");
  return sessao;
}
