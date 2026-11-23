"use client";

import Link from "next/link";
import { useActionState } from "react";
import { entrar, type EstadoForm } from "../acoes";
import { Aviso, Campo } from "@/components/campo";

const avisosLink: Record<string, { tipo: "erro" | "ok"; texto: string }> = {
  confirmado: { tipo: "ok", texto: "E-mail confirmado. Agora é só entrar com seu e-mail e senha." },
  "outro-aparelho": {
    tipo: "erro",
    texto: "Abra o link de nova senha no mesmo celular ou computador em que você pediu. Se preferir, peça um link novo.",
  },
  expirado: { tipo: "erro", texto: "Esse link expirou ou já foi usado. Entre com sua senha ou peça um link novo." },
};

export function FormEntrar({ link }: { link?: string }) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(entrar, {});
  const e = estado.erros ?? {};
  const aviso = link ? avisosLink[link] : undefined;

  return (
    <form action={acao} className="mt-8 grid gap-5" noValidate>
      {aviso && !estado.mensagem && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      {estado.mensagem && <Aviso>{estado.mensagem}</Aviso>}
      <Campo nome="email" rotulo="E-mail" type="email" autoComplete="email" inputMode="email" required defaultValue={estado.valores?.email} erro={e.email} />
      <Campo nome="senha" rotulo="Senha" type="password" autoComplete="current-password" required erro={e.senha} />
      <button type="submit" className="botao botao-principal w-full text-lg" disabled={enviando}>
        {enviando ? "Entrando..." : "Entrar"}
      </button>
      <div className="flex flex-wrap justify-between gap-3 text-tinta-suave">
        <Link href="/recuperar-senha" className="font-bold text-floresta underline">Esqueci a senha</Link>
        <Link href="/cadastro" className="font-bold text-floresta underline">Quero vender aqui</Link>
      </div>
    </form>
  );
}
