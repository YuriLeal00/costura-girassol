"use client";

import Image from "next/image";
import { useState } from "react";

export function Galeria({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const [atual, setAtual] = useState(0);

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-cartao bg-superficie">
        <Image
          key={fotos[atual]}
          src={fotos[atual]}
          alt={`${titulo}, foto ${atual + 1} de ${fotos.length}`}
          fill
          priority
          sizes="(min-width: 768px) 55vw, 100vw"
          className="object-cover motion-safe:animate-[surgir_400ms_ease-out]"
        />
      </div>
      {fotos.length > 1 && (
        <div className="mt-3 flex gap-3" role="group" aria-label="Escolher foto">
          {fotos.map((f, i) => (
            <button
              key={f}
              type="button"
              onClick={() => setAtual(i)}
              aria-label={`Mostrar foto ${i + 1}`}
              aria-pressed={i === atual}
              className={`relative size-20 overflow-hidden rounded-campo border-2 transition-colors ${
                i === atual ? "border-floresta" : "border-transparent opacity-75 hover:opacity-100"
              }`}
            >
              <Image src={f} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
