"use client";

import { useActionState } from "react";
import { pedirNovaSenha, type EstadoForm } from "../acoes";
import { Aviso, Campo } from "@/components/campo";

export default function RecuperarSenha() {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(pedirNovaSenha, {});

  return (
    <div className="mx-auto max-w-md px-4 pt-12 md:pt-20">
      <title>Recuperar senha | Costura Girassol</title>
      <h1 className="text-4xl font-extrabold">Esqueceu a senha?</h1>
      <p className="mt-3 text-tinta-suave">Digite o e-mail do cadastro. Mandamos um link para você criar uma senha nova.</p>
      <form action={acao} className="mt-8 grid gap-5" noValidate>
        {estado.mensagem && <Aviso>{estado.mensagem}</Aviso>}
        {estado.sucesso && <Aviso tipo="ok">{estado.sucesso}</Aviso>}
        <Campo nome="email" rotulo="E-mail" type="email" autoComplete="email" required erro={estado.erros?.email} />
        <button type="submit" className="botao botao-principal w-full" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar link"}
        </button>
      </form>
    </div>
  );
}
