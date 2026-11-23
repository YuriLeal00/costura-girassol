import Link from "next/link";
import { ListIcon, SignInIcon, StorefrontIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { Marca } from "@/components/marca";
import { obterSessao } from "@/lib/sessao";

const links = [
  { href: "/produtos", rotulo: "Vitrine" },
  { href: "/costureiras", rotulo: "Costureiras" },
  { href: "/sobre", rotulo: "Sobre o projeto" },
];

export async function Cabecalho() {
  const { perfil } = await obterSessao();
  const destino = perfil ? (perfil.papel === "admin" ? "/admin" : "/painel") : "/entrar";
  const rotuloConta = perfil ? (perfil.papel === "admin" ? "Administração" : "Meu ateliê") : "Entrar";

  return (
    <header className="sticky top-0 z-40 border-b border-linha/70 bg-papel/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:h-[72px] md:px-8">
        <Marca />

        <nav aria-label="Principal" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 font-bold text-tinta-suave transition-colors hover:bg-superficie hover:text-tinta"
            >
              {l.rotulo}
            </Link>
          ))}
          <Link href={destino} className="botao botao-principal ml-3 min-h-11">
            {perfil ? <StorefrontIcon weight="bold" className="size-5" aria-hidden /> : <SignInIcon weight="bold" className="size-5" aria-hidden />}
            {rotuloConta}
          </Link>
        </nav>

        {/* Menu no celular sem JavaScript: details/summary */}
        <details className="group relative md:hidden">
          <summary className="grid size-11 cursor-pointer list-none place-items-center rounded-full border border-linha [&::-webkit-details-marker]:hidden">
            <ListIcon weight="bold" className="size-6 group-open:hidden" aria-hidden />
            <XIcon weight="bold" className="hidden size-6 group-open:block" aria-hidden />
            <span className="sr-only">Abrir menu</span>
          </summary>
          <nav
            aria-label="Principal no celular"
            className="absolute right-0 top-14 w-64 rounded-cartao border border-linha bg-papel p-2 shadow-cartao"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-campo px-4 py-3 font-bold hover:bg-superficie">
                {l.rotulo}
              </Link>
            ))}
            <Link href={destino} className="botao botao-principal mt-2 w-full">
              {rotuloConta}
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
