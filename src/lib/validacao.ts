import { z } from "zod";

const texto = (min: number, max: number, rotulo: string) =>
  z
    .string()
    .trim()
    .min(min, `${rotulo} precisa ter pelo menos ${min} letras.`)
    .max(max, `${rotulo} pode ter no máximo ${max} caracteres.`);

// Aceita (85) 99999-1234, 85999991234, +55 85 9 9999 1234... e devolve 5585999991234.
export const whatsapp = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .transform((v) => (v.length === 10 || v.length === 11 ? `55${v}` : v))
  .refine((v) => /^55[1-9]{2}9?[0-9]{8}$/.test(v), "Confira o número com DDD. Exemplo: (85) 99999-1234.");

export const esquemaCadastro = z.object({
  nome: texto(3, 120, "Seu nome"),
  email: z.string().trim().toLowerCase().email("Esse e-mail não parece certo."),
  senha: z
    .string()
    .min(8, "A senha precisa ter pelo menos 8 caracteres.")
    .max(72, "A senha pode ter no máximo 72 caracteres.")
    .regex(/[a-zA-Z]/, "Use pelo menos uma letra na senha.")
    .regex(/[0-9]/, "Use pelo menos um número na senha."),
  whatsapp,
  bairro: texto(2, 80, "O bairro"),
  nome_loja: texto(2, 80, "O nome do ateliê"),
  referencia_girassol: z.string().trim().max(200).optional().default(""),
  aceite: z.literal("on", { message: "Para continuar, marque que você leu e aceita os termos." }),
});

export const esquemaLogin = z.object({
  email: z.string().trim().toLowerCase().email("Esse e-mail não parece certo."),
  senha: z.string().min(1, "Digite sua senha.").max(72),
});

export const esquemaPerfil = z.object({
  nome_loja: texto(2, 80, "O nome do ateliê"),
  whatsapp,
  bairro: texto(2, 80, "O bairro"),
  bio: z.string().trim().max(600, "A apresentação pode ter no máximo 600 caracteres.").optional().default(""),
});

// Caminho de foto gerado pelo proprio site: <uuid da mae>/<uuid>.webp
const caminhoFoto = z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.webp$/, "Foto inválida.");

export const esquemaProduto = z.object({
  titulo: texto(3, 90, "O nome da peça"),
  descricao: texto(10, 1500, "A descrição"),
  categoria_id: z.coerce.number().int().min(1, "Escolha uma categoria."),
  preco: z
    .string()
    .trim()
    .transform((v) => v.replace(/\./g, "").replace(",", "."))
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isFinite(v) && v > 0 && v < 100000), "Confira o preço. Exemplo: 45,90."),
  sob_encomenda: z.preprocess((v) => v === "on", z.boolean()),
  prazo_dias: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v)))
    .refine((v) => v === null || (Number.isInteger(v) && v >= 1 && v <= 120), "O prazo vai de 1 a 120 dias."),
  fotos: z.array(caminhoFoto).min(1, "Coloque pelo menos uma foto da peça.").max(5, "No máximo 5 fotos."),
});

export function errosDoCampo(erro: z.ZodError) {
  const saida: Record<string, string> = {};
  for (const issue of erro.issues) {
    const campo = String(issue.path[0] ?? "geral");
    if (!saida[campo]) saida[campo] = issue.message;
  }
  return saida;
}

// Busca: so letras, numeros, espaco e hifen. Evita injecao no filtro do PostgREST.
export function limparBusca(termo: string | undefined) {
  return (termo ?? "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
}
