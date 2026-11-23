"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exigirAdmin } from "@/lib/sessao";

const uuid = z.string().uuid();

async function registrar(acao: string, alvoTipo: string, alvoId: string, detalhe?: string) {
  const { supabase, user } = await exigirAdmin();
  await supabase.from("log_admin").insert({ admin_id: user.id, acao, alvo_tipo: alvoTipo, alvo_id: alvoId, detalhe: detalhe ?? null });
}

export async function decidirCadastro(fd: FormData) {
  const { supabase, user } = await exigirAdmin();
  const id = uuid.safeParse(fd.get("id"));
  const decisao = z.enum(["aprovar", "recusar", "suspender", "reativar"]).safeParse(fd.get("decisao"));
  if (!id.success || !decisao.success || id.data === user.id) return;
  const motivo = String(fd.get("motivo") ?? "").trim().slice(0, 500) || null;

  const mudanca =
    decisao.data === "aprovar" || decisao.data === "reativar"
      ? { status: "aprovada", aprovada_em: new Date().toISOString(), aprovada_por: user.id, motivo_recusa: null }
      : decisao.data === "recusar"
        ? { status: "recusada", motivo_recusa: motivo }
        : { status: "suspensa", motivo_recusa: motivo };

  const { data: alvo, error } = await supabase
    .from("perfis")
    .update(mudanca)
    .eq("id", id.data)
    .eq("papel", "mae")
    .select("nome")
    .single();
  if (!error && alvo) await registrar(decisao.data, "perfil", id.data, motivo ? `${alvo.nome}. Motivo: ${motivo}` : alvo.nome);
  revalidatePath("/admin");
}

export async function moderarProduto(fd: FormData) {
  const { supabase } = await exigirAdmin();
  const id = uuid.safeParse(fd.get("id"));
  if (!id.success) return;
  const ocultar = fd.get("ocultar") === "true";
  const { data: alvo, error } = await supabase
    .from("produtos")
    .update({ oculto_admin: ocultar })
    .eq("id", id.data)
    .select("titulo")
    .single();
  if (!error && alvo) await registrar(ocultar ? "ocultar" : "mostrar", "produto", id.data, alvo.titulo);
  revalidatePath("/admin");
  revalidatePath("/produtos");
}
