type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  nome: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
};

export function Campo({ nome, rotulo, ajuda, erro, ...resto }: Props) {
  const idAjuda = ajuda ? `${nome}-ajuda` : undefined;
  const idErro = erro ? `${nome}-erro` : undefined;
  return (
    <div>
      <label htmlFor={nome} className="rotulo">
        {rotulo}
      </label>
      <input
        id={nome}
        name={nome}
        className="campo"
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idAjuda, idErro].filter(Boolean).join(" ") || undefined}
        {...resto}
      />
      {ajuda && (
        <p id={idAjuda} className="ajuda">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={idErro} className="erro-campo">
          {erro}
        </p>
      )}
    </div>
  );
}

export function AreaTexto({
  nome,
  rotulo,
  ajuda,
  erro,
  ...resto
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { nome: string; rotulo: string; ajuda?: string; erro?: string }) {
  const idAjuda = ajuda ? `${nome}-ajuda` : undefined;
  const idErro = erro ? `${nome}-erro` : undefined;
  return (
    <div>
      <label htmlFor={nome} className="rotulo">
        {rotulo}
      </label>
      <textarea
        id={nome}
        name={nome}
        className="campo min-h-32 resize-y"
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idAjuda, idErro].filter(Boolean).join(" ") || undefined}
        {...resto}
      />
      {ajuda && (
        <p id={idAjuda} className="ajuda">
          {ajuda}
        </p>
      )}
      {erro && (
        <p id={idErro} className="erro-campo">
          {erro}
        </p>
      )}
    </div>
  );
}

export function Aviso({ tipo = "erro", children }: { tipo?: "erro" | "ok"; children: React.ReactNode }) {
  return (
    <div
      role={tipo === "erro" ? "alert" : "status"}
      className={`rounded-campo border-l-4 px-4 py-3 font-bold ${
        tipo === "erro" ? "border-erro bg-erro/10 text-erro" : "border-ok bg-ok/10 text-ok"
      }`}
    >
      {children}
    </div>
  );
}
