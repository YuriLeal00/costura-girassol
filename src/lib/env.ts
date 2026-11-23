// So variaveis publicas aqui. O site nao usa a service role key em lugar nenhum:
// toda permissao passa pelas politicas RLS do banco.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export function urlFoto(caminho: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/produtos/${caminho}`;
}
