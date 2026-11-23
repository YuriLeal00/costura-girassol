"use server";

import { redirect } from "next/navigation";
import { criarClienteServidor } from "@/lib/supabase/server";
import { excedeuLimite } from "@/lib/limite";
import { SITE_URL } from "@/lib/env";
import { errosDoCampo, esquemaCadastro, esquemaLogin } from "@/lib/validacao";
import { z } from "zod";

export type EstadoForm = {
  erros?: Record<string, string>;
  mensagem?: string;
  sucesso?: string;
  valores?: Record<string, string>;
};

function valores(fd: FormData, campos: string[]) {
  return Object.fromEntries(campos.map((c) => [c, String(fd.get(c) ?? "").slice(0, 300)]));
}

export async function cadastrar(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const campos = ["nome", "email", "whatsapp", "bairro", "nome_loja", "referencia_girassol"];
  // Campo isca: pessoas nao veem, robos preenchem.
  if (String(fd.get("site") ?? "") !== "") return { sucesso: "Cadastro recebido." };

  if (await excedeuLimite("cadastro", 5, 10 * 60_000)) {
    return { mensagem: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", valores: valores(fd, campos) };
  }

  const dados = esquemaCadastro.safeParse(Object.fromEntries(fd));
  if (!dados.success) return { erros: errosDoCampo(dados.error), valores: valores(fd, campos) };

  const { email, senha, nome, whatsapp, bairro, nome_loja, referencia_girassol } = dados.data;
  const perfil = { nome, whatsapp, bairro, nome_loja, referencia_girassol };
  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: perfil,
      emailRedirectTo: `${SITE_URL}/auth/confirmar?proximo=/painel`,
    },
  });

  if (error) {
    const texto = error.message.toLowerCase();
    if (texto.includes("already") || texto.includes("registered")) {
      return { erros: { email: "Já existe uma conta com esse e-mail. Tente entrar." }, valores: valores(fd, campos) };
    }
    if (texto.includes("password")) {
      return { erros: { senha: "Escolha uma senha mais forte, com letras e números." }, valores: valores(fd, campos) };
    }
    return { mensagem: "Não deu para concluir o cadastro agora. Tente de novo em instantes.", valores: valores(fd, campos) };
  }

  if (data.session) redirect("/painel");
  return {
    sucesso: `Quase lá. Enviamos um link de confirmação para ${email}. Abra o e-mail e toque no link para ativar sua conta.`,
  };
}

export async function entrar(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const email = String(fd.get("email") ?? "").slice(0, 200);
  if (await excedeuLimite("login", 8, 10 * 60_000)) {
    return { mensagem: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.", valores: { email } };
  }

  const dados = esquemaLogin.safeParse(Object.fromEntries(fd));
  if (!dados.success) return { erros: errosDoCampo(dados.error), valores: { email } };

  const supabase = await criarClienteServidor();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: dados.data.email,
    password: dados.data.senha,
  });

  if (error || !data.user) {
    // Mesma mensagem para e-mail inexistente e senha errada: nao revela quem tem conta.
    if (error?.message.toLowerCase().includes("not confirmed")) {
      return { mensagem: "Confirme seu e-mail antes de entrar. O link está na sua caixa de entrada.", valores: { email } };
    }
    return { mensagem: "E-mail ou senha não conferem.", valores: { email } };
  }

  const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", data.user.id).single();
  redirect(perfil?.papel === "admin" ? "/admin" : "/painel");
}

export async function sair() {
  const supabase = await criarClienteServidor();
  await supabase.auth.signOut();
  redirect("/");
}

export async function pedirNovaSenha(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  if (await excedeuLimite("recuperar", 4, 10 * 60_000)) {
    return { mensagem: "Muitas tentativas seguidas. Espere alguns minutos e tente de novo." };
  }
  const email = z.string().trim().toLowerCase().email().safeParse(fd.get("email"));
  if (!email.success) return { erros: { email: "Esse e-mail não parece certo." } };

  const supabase = await criarClienteServidor();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${SITE_URL}/auth/confirmar?proximo=/nova-senha`,
  });
  // Resposta igual exista ou nao a conta.
  return { sucesso: "Se esse e-mail tiver conta, você vai receber um link para criar uma senha nova." };
}

export async function trocarSenha(_: EstadoForm, fd: FormData): Promise<EstadoForm> {
  const senha = esquemaCadastro.shape.senha.safeParse(fd.get("senha"));
  if (!senha.success) return { erros: { senha: senha.error.issues[0].message } };
  if (fd.get("senha") !== fd.get("confirmacao")) return { erros: { confirmacao: "As duas senhas precisam ser iguais." } };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.auth.updateUser({ password: senha.data });
  if (error) return { mensagem: "O link expirou. Peça um novo na tela de entrar." };
  redirect("/painel");
}
