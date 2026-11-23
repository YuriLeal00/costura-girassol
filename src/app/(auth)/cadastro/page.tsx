import type { Metadata } from "next";
import { FormCadastro } from "./form";

export const metadata: Metadata = {
  title: "Quero vender aqui",
  description: "Cadastro para mães costureiras do Projeto Girassol.",
};

export default function Cadastro() {
  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-10 md:grid-cols-[0.9fr_1.1fr] md:px-8 md:pt-14">
      <aside className="md:sticky md:top-28 md:self-start">
        <h1 className="text-4xl font-extrabold md:text-5xl">Monte seu ateliê no Costura Girassol</h1>
        <p className="mt-5 text-lg text-tinta-suave">
          O cadastro é só para mães que participam do Projeto Girassol. Depois que você envia, a equipe do projeto confirma sua participação e libera o ateliê.
        </p>
        <ol className="mt-8 grid gap-5">
          {[
            ["Você preenche", "Leva uns três minutos. Não pedimos documento nem laudo."],
            ["A equipe confere", "Alguém do Projeto Girassol confirma que você faz parte. Se precisar, a equipe chama você no WhatsApp."],
            ["Ateliê liberado", "Você entra, cadastra as peças com fotos do celular e já aparece na vitrine."],
          ].map(([titulo, texto], i) => (
            <li key={titulo} className="grid grid-cols-[2.25rem_1fr] gap-3">
              <span className="grid size-9 place-items-center rounded-full bg-girassol font-display font-bold text-sobre-girassol">
                {i + 1}
              </span>
              <div>
                <p className="font-bold">{titulo}</p>
                <p className="text-tinta-suave">{texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </aside>
      <FormCadastro />
    </div>
  );
}
