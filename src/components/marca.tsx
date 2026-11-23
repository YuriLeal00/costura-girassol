import Link from "next/link";
import { FlowerIcon } from "@phosphor-icons/react/dist/ssr";

export function Marca({ tamanho = "normal" }: { tamanho?: "normal" | "grande" }) {
  const grande = tamanho === "grande";
  return (
    <Link href="/" className="group inline-flex items-center gap-2 rounded-full" aria-label="Costura Girassol, página inicial">
      <span
        className={`grid place-items-center rounded-full bg-girassol text-sobre-girassol transition-transform duration-500 group-hover:rotate-45 ${grande ? "size-11" : "size-9"}`}
      >
        <FlowerIcon weight="fill" className={grande ? "size-7" : "size-6"} aria-hidden />
      </span>
      <span className={`font-display font-bold leading-none tracking-tight ${grande ? "text-2xl" : "text-xl"}`}>
        Costura <span className="text-floresta">Girassol</span>
      </span>
    </Link>
  );
}
