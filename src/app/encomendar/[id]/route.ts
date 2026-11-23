import { NextResponse, type NextRequest } from "next/server";
import { criarClienteServidor } from "@/lib/supabase/server";
import { excedeuLimite } from "@/lib/limite";
import { obterProdutoPublico } from "@/lib/consultas";
import { SITE_URL } from "@/lib/env";
import { primeiroNome } from "@/lib/formato";

// Monta o link do WhatsApp no servidor. O numero da mae nunca aparece no HTML.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const voltar = NextResponse.redirect(new URL("/produtos", SITE_URL));

  if (await excedeuLimite("encomendar", 30, 60_000)) {
    return new NextResponse("Muitas tentativas. Espere um minuto e tente de novo.", { status: 429 });
  }

  const produto = await obterProdutoPublico(id);
  if (!produto?.mae) return voltar;

  const supabase = await criarClienteServidor();
  const { data: numero } = await supabase.rpc("registrar_clique", { p_produto: id });
  if (typeof numero !== "string" || !/^55\d{10,11}$/.test(numero)) return voltar;

  const mensagem =
    `Oi, ${primeiroNome(produto.mae.nome)}! Vi a peça "${produto.titulo}" no Costura Girassol e quero encomendar. ` +
    `${SITE_URL}/produtos/${produto.id}`;

  const resposta = NextResponse.redirect(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, 302);
  resposta.headers.set("Cache-Control", "no-store");
  resposta.headers.set("X-Robots-Tag", "noindex");
  return resposta;
}
