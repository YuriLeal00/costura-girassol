import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

function montarCsp(nonce: string) {
  const dev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    // Estilo inline liberado: o Next e o next/image injetam estilos sem nonce.
    // O risco real (execucao de codigo) fica barrado pelo script-src com nonce.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' blob: data: ${SUPABASE_URL}`,
    "font-src 'self'",
    `connect-src 'self' ${SUPABASE_URL}${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    dev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = montarCsp(nonce);

  const cabecalhos = new Headers(request.headers);
  cabecalhos.set("x-nonce", nonce);
  cabecalhos.set("Content-Security-Policy", csp);

  let resposta = NextResponse.next({ request: { headers: cabecalhos } });

  // Renova a sessao do Supabase em todo request (padrao do @supabase/ssr).
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(lista) {
        lista.forEach(({ name, value }) => request.cookies.set(name, value));
        resposta = NextResponse.next({ request: { headers: cabecalhos } });
        lista.forEach(({ name, value, options }) =>
          resposta.cookies.set(name, value, {
            ...options,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
          }),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const caminho = request.nextUrl.pathname;
  const areaRestrita = caminho.startsWith("/painel") || caminho.startsWith("/admin");
  if (areaRestrita && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = "";
    const redirecionar = NextResponse.redirect(url);
    redirecionar.headers.set("Content-Security-Policy", csp);
    return redirecionar;
  }

  resposta.headers.set("Content-Security-Policy", csp);
  return resposta;
}

export const config = {
  matcher: [
    {
      source: "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|.*\\.(?:png|jpg|webp|svg)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
