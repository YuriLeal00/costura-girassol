import { nomeAtelie } from "@/lib/formato";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPinIcon } from "@phosphor-icons/react/dist/ssr";
import { Retalho, padroes } from "@/components/tecidos";
import { listarMaes } from "@/lib/consultas";

export const metadata: Metadata = {
  title: "Costureiras",
  description: "Conheça as mães costureiras do Projeto Girassol e os ateliês delas.",
};

const ordemPadroes = Object.keys(padroes) as (keyof typeof padroes)[];

export default async function Costureiras() {
  const maes = await listarMaes();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 md:px-8 md:pt-14">
      <h1 className="max-w-2xl text-4xl font-extrabold md:text-5xl">As mãos por trás de cada peça</h1>
      <p className="mt-4 max-w-[56ch] text-lg text-tinta-suave">
        Cada costureira tem o próprio ateliê, em casa. Entre e veja o que ela faz.
      </p>

      {maes.length > 0 ? (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {maes.map((m, i) => (
            <li key={m.id} className="surgir" style={{ "--i": i } as React.CSSProperties}>
              <Link href={`/costureiras/${m.slug}`} className="group block">
                <Retalho padrao={ordemPadroes[i % ordemPadroes.length]} className="grid aspect-[5/3] place-items-center">
                  <span className="rounded-full bg-papel px-5 py-2 font-display text-3xl font-extrabold text-tinta transition-transform duration-500 group-hover:-rotate-3">
                    {m.nome_loja.charAt(0).toUpperCase()}
                  </span>
                </Retalho>
                <p className="mt-4 font-display text-2xl font-bold group-hover:underline">{nomeAtelie(m.nome_loja)}</p>
                <p className="mt-1 flex items-center gap-1.5 text-tinta-suave">
                  <MapPinIcon weight="bold" className="size-4" aria-hidden /> {m.bairro}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-12 font-display text-2xl font-bold">Os primeiros ateliês abrem em breve.</p>
      )}
    </div>
  );
}
