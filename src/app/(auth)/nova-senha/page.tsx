"use client";

import { useActionState } from "react";
import { trocarSenha, type EstadoForm } from "../acoes";
import { Aviso, Campo } from "@/components/campo";

export default function NovaSenha() {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(trocarSenha, {});

  return (
    <div className="mx-auto max-w-md px-4 pt-12 md:pt-20">
      <title>Nova senha | Costura Girassol</title>
      <h1 className="text-4xl font-extrabold">Crie uma senha nova</h1>
      <form action={acao} className="mt-8 grid gap-5" noValidate>
        {estado.mensagem && <Aviso>{estado.mensagem}</Aviso>}
        <Campo nome="senha" rotulo="Senha nova" type="password" autoComplete="new-password" required ajuda="Pelo menos 8 caracteres, com letras e números." erro={estado.erros?.senha} />
        <Campo nome="confirmacao" rotulo="Repita a senha" type="password" autoComplete="new-password" required erro={estado.erros?.confirmacao} />
        <button type="submit" className="botao botao-principal w-full" disabled={enviando}>
          {enviando ? "Salvando..." : "Salvar senha"}
        </button>
      </form>
    </div>
  );
}
