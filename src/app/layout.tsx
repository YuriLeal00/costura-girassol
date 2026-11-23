import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Bricolage_Grotesque } from "next/font/google";
import { Cabecalho } from "@/components/cabecalho";
import { Rodape } from "@/components/rodape";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const titulo = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--fonte-titulo",
  display: "swap",
});

// Atkinson Hyperlegible foi desenhada para leitura com baixa visao.
const texto = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--fonte-texto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Costura Girassol | Peças feitas por mães costureiras",
    template: "%s | Costura Girassol",
  },
  description:
    "Roupas, bolsas e peças de costura feitas em casa por mães de crianças com TEA do Projeto Girassol. Encomende direto com quem costura.",
  openGraph: { locale: "pt_BR", type: "website", siteName: "Costura Girassol" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1813" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${titulo.variable} ${texto.variable}`}>
      <body className="flex min-h-[100dvh] flex-col antialiased">
        <a
          href="#conteudo"
          className="botao botao-destaque fixed left-4 top-3 z-50 -translate-y-24 focus:translate-y-0"
        >
          Pular para o conteúdo
        </a>
        <Cabecalho />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Rodape />
      </body>
    </html>
  );
}
