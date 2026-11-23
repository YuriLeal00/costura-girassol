import type { Metadata } from "next";
import Link from "next/link";
import { Retalho } from "@/components/tecidos";

export const metadata: Metadata = {
  title: "Sobre o projeto",
  description: "Por que o Costura Girassol existe, quem são as costureiras e como a Unifor e o Projeto Girassol trabalham juntos.",
};

// REVISAR com o grupo: confirmar o nome da prefeitura parceira, o curso da Unifor
// e como o Projeto Girassol se descreve. Os textos abaixo nao trazem numeros de proposito:
// so entram dados que o grupo puder citar com fonte.

const parceiros = [
  {
    nome: "Projeto Girassol",
    papel: "Reúne as mães e confirma quem participa. Cada ateliê só entra na vitrine depois que a equipe do projeto aprova.",
  },
  {
    nome: "Unifor",
    papel: "Estudantes da Universidade de Fortaleza criaram o site como trabalho acadêmico e cuidam dele durante o projeto.",
  },
  {
    nome: "Prefeitura",
    papel: "Apoia a iniciativa e ajuda a levar o site até as famílias que podem usar.",
  },
];

export default function Sobre() {
  return (
    <div className="pt-10 md:pt-16">
      <section className="mx-auto max-w-4xl px-4 md:px-8">
        <h1 className="text-4xl font-extrabold md:text-6xl">Um jeito de vender sem sair de perto do filho.</h1>
        <p className="mt-6 max-w-[58ch] text-xl text-tinta-suave">
          O Costura Girassol é uma vitrine on-line para mães de crianças com TEA (Transtorno do Espectro Autista) que costuram em casa.
        </p>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl gap-10 px-4 md:grid-cols-[16rem_1fr] md:px-8">
        <h2 className="text-2xl font-bold md:sticky md:top-28 md:self-start">A rotina dessas mães</h2>
        <div className="grid max-w-[64ch] gap-5 text-lg">
          <p>
            Uma criança com TEA costuma ter uma agenda cheia: fonoaudiologia, terapia ocupacional, psicologia, escola, consultas. Os horários mudam, as crises não avisam, e quase sempre é a mãe quem acompanha tudo.
          </p>
          <p>
            Com essa rotina, um emprego com horário fixo fica difícil de manter. Muitas dessas mães já sabiam costurar, ou aprenderam, e passaram a fazer roupas, bolsas e consertos em casa, nos intervalos.
          </p>
          <p>
            O trabalho elas sabem fazer. O que falta é tempo para divulgar, montar catálogo e atender cliente em várias redes ao mesmo tempo. É essa parte que o site tenta resolver.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 md:px-8">
        <Retalho padrao="listra" className="grid gap-8 p-8 text-sobre-floresta md:grid-cols-2 md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">O que o site faz por elas</h2>
          <ul className="grid gap-4 text-lg">
            <li>Cada mãe tem um ateliê com as próprias peças, fotos e preços, que ela mesma atualiza pelo celular.</li>
            <li>Quem compra fala direto com ela no WhatsApp. Não existe carrinho nem intermediário.</li>
            <li>O site não cobra comissão nem mensalidade. O dinheiro da venda fica todo com a costureira.</li>
            <li>Ninguém precisa enviar laudo ou documento médico. Quem confirma a participação é a equipe do Projeto Girassol.</li>
          </ul>
        </Retalho>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4 md:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Quem faz o projeto</h2>
        <dl className="mt-8 divide-y divide-dashed divide-linha border-y border-dashed border-linha">
          {parceiros.map((p) => (
            <div key={p.nome} className="grid gap-2 py-6 md:grid-cols-[16rem_1fr]">
              <dt className="font-display text-2xl font-bold">{p.nome}</dt>
              <dd className="max-w-[60ch] text-lg text-tinta-suave">{p.papel}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mx-auto mt-20 max-w-4xl px-4 text-center md:px-8">
        <h2 className="text-3xl font-bold md:text-4xl">Como ajudar</h2>
        <p className="mx-auto mt-4 max-w-[52ch] text-lg text-tinta-suave">
          Encomende uma peça, peça um conserto ou mande o link do site para alguém que precisa de costureira.
        </p>
        <Link href="/produtos" className="botao botao-principal mt-8">Ver a vitrine</Link>
      </section>
    </div>
  );
}
