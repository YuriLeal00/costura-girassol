export function TextoLegal({ titulo, atualizado, children }: { titulo: string; atualizado: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 pt-10 md:px-8 md:pt-14">
      <h1 className="text-4xl font-extrabold md:text-5xl">{titulo}</h1>
      <p className="mt-3 text-tinta-suave">Atualizado em {atualizado}</p>
      <div className="mt-10 grid gap-5 text-lg [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-2">
        {children}
      </div>
    </article>
  );
}
