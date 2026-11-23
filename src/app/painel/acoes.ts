"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exigirLogin, exigirMaeAprovada } from "@/lib/sessao";
import { errosDoCampo, esquemaPerfil, esquemaProduto } from "@/lib/validacao";
import type { EstadoForm } from "@/app/(auth)/acoes";

const uuid = z.string().uuid();

export async function salvarProduto(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const { supabase, user } = await exigirMaeAprovada();

  const bruto = { ...Object.fromEntries(fd), fotos: fd.getAll("fotos").map(String) };
  const dados = esquemaProduto.safeParse(bruto);
  if (!dados.success) return { erros: errosDoCampo(dados.error) };

  // Cada foto precisa estar na pasta da propria mae.
  if (dados.data.fotos.some((f) => !f.startsWith(`${user.id}/`))) {
    return { erros: { fotos: "Alguma foto não pertence a você. Envie de novo." } };
  }

  const id = fd.get("id");
  if (id) {
    const alvo = uuid.safeParse(id);
    if (!alvo.success) return { mensagem: "Peça não encontrada." };
    const { error } = await supabase.from("produtos").update(dados.data).eq("id", alvo.data).eq("mae_id", user.id);
    if (error) return { mensagem: "Não deu para salvar. Tente de novo." };
  } else {
    const { error } = await supabase.from("produtos").insert({ ...dados.data, mae_id: user.id });
    if (error) return { mensagem: "Não deu para salvar. Tente de novo." };
  }

  revalidatePath("/painel");
  revalidatePath("/produtos");
  redirect("/painel?salvo=1");
}

export async function alternarProduto(fd: FormData) {
  const { supabase, user } = await exigirMaeAprovada();
  const id = uuid.safeParse(fd.get("id"));
  if (!id.success) return;
  const ativo = fd.get("ativo") === "true";
  await supabase.from("produtos").update({ ativo: !ativo }).eq("id", id.data).eq("mae_id", user.id);
  revalidatePath("/painel");
}

export async function apagarProduto(fd: FormData) {
  const { supabase, user } = await exigirLogin();
  const id = uuid.safeParse(fd.get("id"));
  if (!id.success) return;
  const { data } = await supabase.from("produtos").select("fotos").eq("id", id.data).eq("mae_id", user.id).single();
  if (!data) return;
  await supabase.from("produtos").delete().eq("id", id.data).eq("mae_id", user.id);
  const minhas = (data.fotos as string[]).filter((f) => f.startsWith(`${user.id}/`));
  if (minhas.length) await supabase.storage.from("produtos").remove(minhas);
  revalidatePath("/painel");
  redirect("/painel");
}

export async function salvarPerfil(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const { supabase, user } = await exigirLogin();
  const dados = esquemaPerfil.safeParse(Object.fromEntries(fd));
  if (!dados.success) return { erros: errosDoCampo(dados.error) };
  const { error } = await supabase
    .from("perfis")
    .update({ ...dados.data, bio: dados.data.bio || null })
    .eq("id", user.id);
  if (error) return { mensagem: "Não deu para salvar. Tente de novo." };
  revalidatePath("/painel");
  return { sucesso: "Pronto, seu ateliê foi atualizado." };
}
