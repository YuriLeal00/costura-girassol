const moeda = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarPreco(preco: number | null) {
  return preco === null ? "Sob consulta" : moeda.format(preco);
}

export function formatarWhatsapp(numero: string) {
  const n = numero.replace(/^55/, "");
  if (n.length === 11) return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  if (n.length === 10) return `(${n.slice(0, 2)}) ${n.slice(2, 6)}-${n.slice(6)}`;
  return numero;
}

// "Linha da Rita" vira "Ateliê Linha da Rita"; "Ateliê Ponto Cheio" fica como esta.
export function nomeAtelie(nomeLoja: string) {
  return /^ateli[eê]\b/i.test(nomeLoja.trim()) ? nomeLoja : `Ateliê ${nomeLoja}`;
}

export function primeiroNome(nome: string) {
  return nome.trim().split(/\s+/)[0] ?? nome;
}

const data = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
export function formatarData(iso: string) {
  return data.format(new Date(iso));
}
