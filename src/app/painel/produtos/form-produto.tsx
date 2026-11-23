"use client";

import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { CameraIcon, TrashIcon } from "@phosphor-icons/react";
import { salvarProduto } from "../acoes";
import type { EstadoForm } from "@/app/(auth)/acoes";
import { AreaTexto, Aviso, Campo } from "@/components/campo";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { urlFoto } from "@/lib/env";
import type { Categoria, Produto } from "@/lib/consultas";

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function FormProduto({
  maeId,
  categorias,
  produto,
}: {
  maeId: string;
  categorias: Categoria[];
  produto?: Produto;
}) {
  const [estado, acao, salvando] = useActionState<EstadoForm, FormData>(salvarProduto, {});
  const [fotos, setFotos] = useState<string[]>(produto?.fotos ?? []);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const seletor = useRef<HTMLInputElement>(null);
  const e = estado.erros ?? {};

  async function adicionarFotos(lista: FileList | null) {
    if (!lista) return;
    setErroFoto(null);
    const vagas = 5 - fotos.length;
    const arquivos = Array.from(lista).slice(0, vagas);
    if (arquivos.some((f) => !TIPOS.includes(f.type))) {
      setErroFoto("Use fotos em JPG, PNG ou WEBP.");
      return;
    }
    if (arquivos.some((f) => f.size > 25 * 1024 * 1024)) {
      setErroFoto("Alguma foto é grande demais. Tente outra.");
      return;
    }

    setEnviandoFoto(true);
    const supabase = criarClienteNavegador();
    try {
      for (const arquivo of arquivos) {
        // Recomprime no celular: arquivo menor e sem metadados (EXIF/GPS).
        const comprimida = await imageCompression(arquivo, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1600,
          fileType: "image/webp",
          // O worker da biblioteca baixa script de CDN, o que o nosso CSP bloqueia de proposito.
          useWebWorker: false,
          initialQuality: 0.82,
        });
        const caminho = `${maeId}/${crypto.randomUUID()}.webp`;
        const { error } = await supabase.storage
          .from("produtos")
          .upload(caminho, comprimida, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
        if (error) throw error;
        setFotos((atual) => [...atual, caminho]);
      }
    } catch {
      setErroFoto("Não deu para enviar a foto. Confira a internet e tente de novo.");
    } finally {
      setEnviandoFoto(false);
      if (seletor.current) seletor.current.value = "";
    }
  }

  function removerFoto(caminho: string) {
    setFotos((atual) => atual.filter((f) => f !== caminho));
    // Foto nova ainda nao salva: apaga do Storage na hora.
    if (!produto?.fotos.includes(caminho)) {
      void criarClienteNavegador().storage.from("produtos").remove([caminho]);
    }
  }

  return (
    <form action={acao} className="mt-8 grid gap-6" noValidate>
      {estado.mensagem && <Aviso>{estado.mensagem}</Aviso>}
      {produto && <input type="hidden" name="id" value={produto.id} />}
      {fotos.map((f) => (
        <input key={f} type="hidden" name="fotos" value={f} />
      ))}

      <fieldset>
        <legend className="rotulo">Fotos da peça (até 5)</legend>
        <p className="ajuda mb-3 mt-0">A primeira foto é a capa. Fotografe de dia, perto da janela, com um fundo liso.</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {fotos.map((f, i) => (
            <div key={f} className="relative aspect-square overflow-hidden rounded-campo bg-superficie">
              <Image src={urlFoto(f)} alt={`Foto ${i + 1}`} fill sizes="160px" className="object-cover" />
              {i === 0 && <span className="etiqueta absolute left-1.5 top-1.5 bg-girassol text-xs text-sobre-girassol">Capa</span>}
              <button
                type="button"
                onClick={() => removerFoto(f)}
                className="absolute bottom-1.5 right-1.5 grid size-9 place-items-center rounded-full bg-papel text-erro shadow-cartao"
                aria-label={`Remover foto ${i + 1}`}
              >
                <TrashIcon weight="bold" className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          {fotos.length < 5 && (
            <label className="grid aspect-square cursor-pointer place-items-center rounded-campo border-2 border-dashed border-linha text-center text-tinta-suave transition-colors hover:border-floresta hover:text-floresta">
              <span className="grid justify-items-center gap-1 p-2 text-sm font-bold">
                <CameraIcon weight="bold" className="size-7" aria-hidden />
                {enviandoFoto ? "Enviando..." : "Adicionar"}
              </span>
              <input
                ref={seletor}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                multiple
                className="sr-only"
                disabled={enviandoFoto}
                onChange={(ev) => adicionarFotos(ev.target.files)}
              />
            </label>
          )}
        </div>
        {(erroFoto || e.fotos) && <p className="erro-campo">{erroFoto ?? e.fotos}</p>}
      </fieldset>

      <Campo nome="titulo" rotulo="Nome da peça" placeholder="Ex.: Vestido de chita infantil" maxLength={90} defaultValue={produto?.titulo} required erro={e.titulo} />

      <div>
        <label htmlFor="categoria_id" className="rotulo">Categoria</label>
        <select id="categoria_id" name="categoria_id" className="campo" defaultValue={produto?.categoria_id ?? ""} required aria-invalid={e.categoria_id ? true : undefined}>
          <option value="" disabled>Escolha uma</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        {e.categoria_id && <p className="erro-campo">{e.categoria_id}</p>}
      </div>

      <AreaTexto
        nome="descricao"
        rotulo="Descrição"
        maxLength={1500}
        defaultValue={produto?.descricao}
        ajuda="Tecido, tamanhos, cores disponíveis e cuidados de lavagem."
        required
        erro={e.descricao}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          nome="preco"
          rotulo="Preço (R$)"
          inputMode="decimal"
          placeholder="45,90"
          defaultValue={produto?.preco != null ? String(produto.preco).replace(".", ",") : ""}
          ajuda="Deixe vazio para mostrar Sob consulta."
          erro={e.preco}
        />
        <Campo
          nome="prazo_dias"
          rotulo="Prazo para ficar pronta (dias)"
          inputMode="numeric"
          placeholder="7"
          defaultValue={produto?.prazo_dias ?? ""}
          ajuda="Opcional."
          erro={e.prazo_dias}
        />
      </div>

      <label className="flex items-start gap-3 rounded-campo bg-superficie p-4">
        <input type="checkbox" name="sob_encomenda" defaultChecked={produto?.sob_encomenda} className="mt-1 size-5 shrink-0 accent-[var(--floresta)]" />
        <span>
          <span className="font-bold">Faço sob encomenda</span>
          <span className="block text-tinta-suave">Marque se você costura a peça depois do pedido, no tamanho da cliente.</span>
        </span>
      </label>

      <button type="submit" className="botao botao-principal text-lg" disabled={salvando || enviandoFoto}>
        {salvando ? "Salvando..." : produto ? "Salvar alterações" : "Publicar peça"}
      </button>
    </form>
  );
}
