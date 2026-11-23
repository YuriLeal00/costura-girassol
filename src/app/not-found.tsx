import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="etiqueta bg-girassol text-sobre-girassol">Erro 404</p>
      <h1 className="mt-5 text-4xl font-extrabold">Essa linha se perdeu.</h1>
      <p className="mt-3 text-tinta-suave">A página que você procurou não existe ou foi retirada do ar.</p>
      <Link href="/produtos" className="botao botao-principal mt-8">Ver a vitrine</Link>
    </div>
  );
}
