// Padroes de tecido feitos so com CSS (xadrez vichy, listra, poa).
// Aparecem enquanto a vitrine ainda nao tem fotos suficientes.
export const padroes = {
  vichy: {
    backgroundColor: "var(--girassol)",
    backgroundImage:
      "linear-gradient(90deg, rgb(255 255 255 / 0.32) 50%, transparent 50%), linear-gradient(rgb(255 255 255 / 0.32) 50%, transparent 50%)",
    backgroundSize: "28px 28px",
  },
  listra: {
    backgroundColor: "var(--floresta)",
    backgroundImage: "repeating-linear-gradient(135deg, rgb(255 255 255 / 0.13) 0 10px, transparent 10px 22px)",
  },
  poa: {
    backgroundColor: "var(--superficie-forte)",
    backgroundImage: "radial-gradient(var(--tinta-suave) 2.2px, transparent 2.6px)",
    backgroundSize: "18px 18px",
  },
} satisfies Record<string, React.CSSProperties>;

export function Retalho({
  padrao,
  className = "",
  children,
}: {
  padrao: keyof typeof padroes;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`remendo overflow-hidden rounded-cartao text-papel ${className}`} style={padroes[padrao]}>
      {children}
    </div>
  );
}
