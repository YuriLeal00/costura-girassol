"use client";

import { useActionState } from "react";
import { salvarPerfil } from "../acoes";
import type { EstadoForm } from "@/app/(auth)/acoes";
import { AreaTexto, Aviso, Campo } from "@/components/campo";

type Inicial = { nome_loja: string; whatsapp: string; bairro: string; bio: string };

export function FormPerfil({ inicial }: { inicial: Inicial }) {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(salvarPerfil, {});
  const e = estado.erros ?? {};
  return (
    <form action={acao} className="mt-8 grid gap-5" noValidate>
      {estado.mensagem && <Aviso>{estado.mensagem}</Aviso>}
      {estado.sucesso && <Aviso tipo="ok">{estado.sucesso}</Aviso>}
      <Campo nome="nome_loja" rotulo="Nome do ateliê" defaultValue={inicial.nome_loja} required erro={e.nome_loja} />
      <Campo nome="whatsapp" rotulo="WhatsApp com DDD" type="tel" inputMode="tel" defaultValue={inicial.whatsapp} required erro={e.whatsapp} />
      <Campo nome="bairro" rotulo="Bairro" defaultValue={inicial.bairro} required erro={e.bairro} />
      <AreaTexto
        nome="bio"
        rotulo="Sua apresentação"
        maxLength={600}
        defaultValue={inicial.bio}
        ajuda="Conte há quanto tempo você costura e o que mais gosta de fazer. Não precisa falar do seu filho se não quiser."
        erro={e.bio}
      />
      <button type="submit" className="botao botao-principal" disabled={enviando}>
        {enviando ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
