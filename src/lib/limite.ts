import "server-only";
import { headers } from "next/headers";

// Limite simples por IP, em memoria. Funciona por instancia do servidor:
// e uma segunda barreira, a primeira sao os limites do proprio Supabase Auth.
const janelas = new Map<string, { inicio: number; total: number }>();

export async function ipDaRequisicao() {
  const h = await headers();
  return (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "local";
}

export async function excedeuLimite(chave: string, maximo: number, janelaMs: number) {
  const id = `${chave}:${await ipDaRequisicao()}`;
  const agora = Date.now();
  const atual = janelas.get(id);
  if (!atual || agora - atual.inicio > janelaMs) {
    janelas.set(id, { inicio: agora, total: 1 });
    if (janelas.size > 5000) janelas.clear();
    return false;
  }
  atual.total += 1;
  return atual.total > maximo;
}
