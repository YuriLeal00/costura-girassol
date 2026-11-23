"use client";

import Link from "next/link";
import { useActionState } from "react";
import { cadastrar, type EstadoForm } from "../acoes";
import { Aviso, Campo } from "@/components/campo";

export function FormCadastro() {
  const [estado, acao, enviando] = useActionState<EstadoForm, FormData>(cadastrar, {});
  const v = estado.valores ?? {};
  const e = estado.erros ?? {};

  if (estado.sucesso) {
    return (
      <div className="remendo rounded-cartao bg-superficie p-8 text-tinta">
        <h2 className="text-3xl font-bold">Cadastro enviado</h2>
        <p className="mt-3 text-lg">{estado.sucesso}</p>
        <p className="mt-3 text-tinta-suave">Depois de confirmar, a equipe do Projeto Girassol libera seu ateliê.</p>
      </div>
    );
  }

  return (
    <form action={acao} className="grid gap-8 rounded-cartao border border-linha bg-papel p-5 md:p-8" noValidate>
      {estado.mensagem && <Aviso>{estado.mensagem}</Aviso>}

      <fieldset className="grid gap-5">
        <legend className="mb-4 font-display text-2xl font-bold">Sobre você</legend>
        <Campo nome="nome" rotulo="Nome completo" autoComplete="name" required defaultValue={v.nome} erro={e.nome} />
        <Campo nome="email" rotulo="E-mail" type="email" autoComplete="email" inputMode="email" required defaultValue={v.email} erro={e.email} />
        <Campo
          nome="senha"
          rotulo="Crie uma senha"
          type="password"
          autoComplete="new-password"
          required
          ajuda="Pelo menos 8 caracteres, com letras e números."
          erro={e.senha}
        />
        <Campo
          nome="whatsapp"
          rotulo="WhatsApp com DDD"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          placeholder="(85) 99999-1234"
          required
          ajuda="É por ele que as clientes vão falar com você."
          defaultValue={v.whatsapp}
          erro={e.whatsapp}
        />
      </fieldset>

      <div className="pesponto" aria-hidden />

      <fieldset className="grid gap-5">
        <legend className="mb-4 font-display text-2xl font-bold">Seu ateliê</legend>
        <Campo
          nome="nome_loja"
          rotulo="Nome do ateliê"
          placeholder="Ex.: Linha da Dona Rita"
          required
          ajuda="Pode ser seu nome ou um apelido. Ele aparece na vitrine."
          defaultValue={v.nome_loja}
          erro={e.nome_loja}
        />
        <Campo nome="bairro" rotulo="Bairro" autoComplete="address-level3" required ajuda="Mostramos só o bairro, nunca o endereço." defaultValue={v.bairro} erro={e.bairro} />
        <Campo
          nome="referencia_girassol"
          rotulo="Como a equipe do Projeto Girassol conhece você? (opcional)"
          ajuda="Ex.: nome de quem indicou você, ou o dia do encontro que você frequenta. Ajuda a equipe a confirmar mais rápido."
          defaultValue={v.referencia_girassol}
          erro={e.referencia_girassol}
        />
      </fieldset>

      {/* Campo isca contra robos: escondido de pessoas e de leitores de tela */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="site">Não preencha</label>
        <input id="site" name="site" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="aceite" className="mt-1 size-5 shrink-0 accent-[var(--floresta)]" required aria-invalid={e.aceite ? true : undefined} />
          <span>
            Li e aceito os <Link href="/termos" target="_blank" className="font-bold text-floresta underline">termos de uso</Link> e a{" "}
            <Link href="/privacidade" target="_blank" className="font-bold text-floresta underline">política de privacidade</Link>.
          </span>
        </label>
        {e.aceite && <p className="erro-campo">{e.aceite}</p>}
      </div>

      <button type="submit" className="botao botao-principal w-full text-lg" disabled={enviando}>
        {enviando ? "Enviando..." : "Enviar cadastro"}
      </button>
      <p className="text-center text-tinta-suave">
        Já tem conta? <Link href="/entrar" className="font-bold text-floresta underline">Entrar</Link>
      </p>
    </form>
  );
}
