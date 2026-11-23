import Link from "next/link";
import { Marca } from "@/components/marca";

export function Rodape() {
  return (
    <footer className="mt-24 bg-rodape text-sobre-rodape">
      <div className="pesponto mx-auto max-w-7xl text-sobre-rodape" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div className="max-w-sm [&_a]:text-sobre-rodape [&_.text-floresta]:text-girassol">
          <Marca />
          <p className="mt-4 opacity-85">
            Peças costuradas em casa por mães de crianças com TEA. Um projeto da Unifor com o Projeto Girassol.
          </p>
        </div>
        <nav aria-label="Rodapé" className="grid content-start gap-2">
          <p className="font-display text-lg font-bold">Navegar</p>
          <Link href="/produtos" className="opacity-85 hover:underline hover:opacity-100">Vitrine</Link>
          <Link href="/costureiras" className="opacity-85 hover:underline hover:opacity-100">Costureiras</Link>
          <Link href="/sobre" className="opacity-85 hover:underline hover:opacity-100">Sobre o projeto</Link>
        </nav>
        <nav aria-label="Informações" className="grid content-start gap-2">
          <p className="font-display text-lg font-bold">Para as costureiras</p>
          <Link href="/cadastro" className="opacity-85 hover:underline hover:opacity-100">Quero vender aqui</Link>
          <Link href="/termos" className="opacity-85 hover:underline hover:opacity-100">Termos de uso</Link>
          <Link href="/privacidade" className="opacity-85 hover:underline hover:opacity-100">Privacidade</Link>
        </nav>
      </div>
    </footer>
  );
}
