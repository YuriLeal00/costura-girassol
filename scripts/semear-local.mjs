// Popula o Supabase LOCAL com dados de demonstracao.
// Uso: npm run semear   (le as chaves do `supabase status`; nunca rode contra producao)
import { execSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { writeFileSync } from "node:fs";
import { deflateSync } from "node:zlib";
import { createClient } from "@supabase/supabase-js";

const saida = process.env.SUPABASE_STATUS_ENV ?? execSync("npx supabase status -o env", { encoding: "utf8" });
const status = Object.fromEntries(
  saida
    .split(/\r?\n/)
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, "")];
    }),
);

const url = status.API_URL;
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(url)) {
  console.error("Este script so roda contra o Supabase local.");
  process.exit(1);
}
const admin = createClient(url, status.SERVICE_ROLE_KEY, { auth: { persistSession: false } });

// PNG minimo em Node puro: padrao xadrez ou listrado, para servir de foto de demonstracao.
function png(largura, altura, pixel) {
  const linhas = Buffer.alloc((largura * 3 + 1) * altura);
  for (let y = 0; y < altura; y++) {
    linhas[y * (largura * 3 + 1)] = 0;
    for (let x = 0; x < largura; x++) {
      const [r, g, b] = pixel(x, y);
      const o = y * (largura * 3 + 1) + 1 + x * 3;
      linhas[o] = r;
      linhas[o + 1] = g;
      linhas[o + 2] = b;
    }
  }
  const crc = (buf) => {
    let c = ~0;
    for (const byte of buf) {
      c ^= byte;
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return ~c >>> 0;
  };
  const bloco = (tipo, dados) => {
    const t = Buffer.from(tipo);
    const tam = Buffer.alloc(4);
    tam.writeUInt32BE(dados.length);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(Buffer.concat([t, dados])));
    return Buffer.concat([tam, t, dados, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloco("IHDR", ihdr),
    bloco("IDAT", deflateSync(linhas)),
    bloco("IEND", Buffer.alloc(0)),
  ]);
}

const tecidos = {
  vichy: ([r, g, b]) => (x, y) => {
    const a = Math.floor(x / 40) % 2, c = Math.floor(y / 40) % 2;
    const k = a && c ? 0.75 : a || c ? 0.88 : 1;
    return [r * k + 255 * (1 - k) * 0.2, g * k + 255 * (1 - k) * 0.2, b * k + 255 * (1 - k) * 0.2].map(Math.round);
  },
  listra: ([r, g, b]) => (x, y) => ((x + y) % 64 < 22 ? [245, 243, 236] : [r, g, b]),
  poa: ([r, g, b]) => (x, y) => {
    const dx = (x % 48) - 24, dy = (y % 48) - 24;
    return dx * dx + dy * dy < 64 ? [250, 248, 240] : [r, g, b];
  },
};

// Numeros de WhatsApp ficticios (85 9 0000-000X): nao pertencem a ninguem.
const senhas = {};
async function criarUsuaria(email, meta) {
  const senha = `Teste-${randomBytes(6).toString("hex")}1`;
  senhas[email] = senha;
  const { data: lista } = await admin.auth.admin.listUsers();
  const existente = lista.users.find((u) => u.email === email);
  if (existente) {
    await admin.auth.admin.updateUserById(existente.id, { password: senha });
    return existente.id;
  }
  const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true, user_metadata: meta });
  if (error) throw error;
  return data.user.id;
}

const idAdmin = await criarUsuaria("admin@girassol.test", {
  nome: "Coordenação Girassol",
  nome_loja: "Coordenação",
  whatsapp: "5585900000000",
  bairro: "Centro",
});
await admin.from("perfis").update({ papel: "admin", status: "aprovada", aprovada_em: new Date().toISOString() }).eq("id", idAdmin);

const idRita = await criarUsuaria("rita@girassol.test", {
  nome: "Rita Maria Nogueira",
  nome_loja: "Linha da Rita",
  whatsapp: "5585900000001",
  bairro: "Messejana",
});
await admin
  .from("perfis")
  .update({
    status: "aprovada",
    aprovada_em: new Date().toISOString(),
    aprovada_por: idAdmin,
    bio: "Costuro desde os 15 anos, quando aprendi com a minha avó. Hoje faço roupa infantil sob medida e conserto de tudo um pouco, entre uma terapia e outra do Davi.",
  })
  .eq("id", idRita);

await criarUsuaria("joana@girassol.test", {
  nome: "Joana Ferreira Lima",
  nome_loja: "Ateliê Ponto Cheio",
  whatsapp: "5585900000002",
  bairro: "Parangaba",
  referencia_girassol: "Indicada pela Lúcia, do encontro de terça",
});

const pecas = [
  ["Vestido de chita infantil", 1, 89.9, true, 7, "vichy", [232, 163, 23], "Vestido rodado em chita, com elástico nas costas para não apertar. Faço do 1 ao 10 anos. Tecido 100% algodão, não pinica."],
  ["Bolsa de tecido com forro", 3, 54.0, false, null, "listra", [29, 74, 54], "Bolsa de ombro em lona listrada, forrada, com bolso interno e zíper. Cabe caderno e garrafinha."],
  ["Kit 3 fronhas de algodão", 4, 45.0, false, null, "poa", [168, 190, 172], "Fronhas 50x70 em algodão de poá, com acabamento em viés. Lavou, secou, usou."],
  ["Ajuste de barra e cintura", 7, null, true, 3, "listra", [71, 89, 78], "Faço barra, ajuste de cintura, troca de zíper e pequenos reparos. Me chame com uma foto da peça que eu passo o valor."],
  ["Pijama de flanela infantil", 1, 72.5, true, 10, "vichy", [29, 74, 54], "Pijama de manga longa em flanela xadrez, sem etiqueta interna e com costuras viradas para fora, que incomodam menos a pele."],
];

const { data: existentes } = await admin.from("produtos").select("id").eq("mae_id", idRita);
if (!existentes?.length) {
  for (const [titulo, categoria_id, preco, sob_encomenda, prazo_dias, tecido, cor, descricao] of pecas) {
    const caminho = `${idRita}/${crypto.randomUUID()}.webp`;
    // Bucket so aceita jpeg/png/webp; salvamos PNG com o nome .webp para seguir o padrao de caminho do site.
    const { error } = await admin.storage
      .from("produtos")
      .upload(caminho, png(800, 1000, tecidos[tecido](cor)), { contentType: "image/png" });
    if (error) throw error;
    await admin.from("produtos").insert({ mae_id: idRita, titulo, categoria_id, preco, sob_encomenda, prazo_dias, descricao, fotos: [caminho] });
  }
}

// Segunda mae aprovada, com uma peca: serve de alvo para o teste de IDOR do pentest.
const idCida = await criarUsuaria("cida@girassol.test", {
  nome: "Aparecida Sousa Rocha",
  nome_loja: "Cida Bordados",
  whatsapp: "5585900000003",
  bairro: "Conjunto Ceará",
});
await admin.from("perfis").update({ status: "aprovada", aprovada_em: new Date().toISOString(), aprovada_por: idAdmin }).eq("id", idCida);
const { data: daCida } = await admin.from("produtos").select("id").eq("mae_id", idCida);
if (!daCida?.length) {
  const caminho = `${idCida}/${crypto.randomUUID()}.webp`;
  await admin.storage.from("produtos").upload(caminho, png(800, 1000, tecidos.poa([168, 35, 27])), { contentType: "image/png" });
  await admin.from("produtos").insert({
    mae_id: idCida, titulo: "Toalha de mão bordada", categoria_id: 4, preco: 38, sob_encomenda: true, prazo_dias: 6, fotos: [caminho],
    descricao: "Toalha de mão de algodão com barrado bordado em ponto cruz. Bordo o nome ou a inicial que você escolher.",
  });
}

writeFileSync(
  "scripts/.credenciais-locais.txt",
  `# Contas de teste do Supabase LOCAL (gerado por npm run semear). Nao use em producao.\n` +
    Object.entries(senhas).map(([e, s]) => `${e}  ${s}`).join("\n") +
    "\n",
);
console.log("Pronto. Contas de teste em scripts/.credenciais-locais.txt");
