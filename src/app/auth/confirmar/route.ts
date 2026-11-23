import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { criarClienteServidor } from "@/lib/supabase/server";

const destinosPermitidos = new Set(["/painel", "/nova-senha"]);

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const tipo = searchParams.get("type") as EmailOtpType | null;
  const codigo = searchParams.get("code");
  // So aceita destinos internos conhecidos: evita open redirect.
  const proximo = destinosPermitidos.has(searchParams.get("proximo") ?? "") ? searchParams.get("proximo")! : "/painel";

  const supabase = await criarClienteServidor();
  let ok = false;
  if (tokenHash && tipo) {
    ok = !(await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })).error;
  } else if (codigo) {
    ok = !(await supabase.auth.exchangeCodeForSession(codigo)).error;
  }

  const url = request.nextUrl.clone();
  url.search = "";
  url.pathname = ok ? proximo : "/entrar";
  if (!ok) {
    // Com `code`, o Supabase ja confirmou o e-mail antes de redirecionar. A troca so falha
    // quando o link e aberto em outro aparelho (o verificador PKCE ficou no navegador do cadastro).
    const situacao = codigo && !searchParams.get("error") ? (proximo === "/nova-senha" ? "outro-aparelho" : "confirmado") : "expirado";
    url.searchParams.set("link", situacao);
  }
  return NextResponse.redirect(url);
}
