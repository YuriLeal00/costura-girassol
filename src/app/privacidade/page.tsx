import type { Metadata } from "next";
import { TextoLegal } from "@/components/texto-legal";

export const metadata: Metadata = { title: "Política de privacidade" };

// REVISAR: indicar o encarregado de dados (LGPD, art. 41) antes do uso oficial.
export default function Privacidade() {
  return (
    <TextoLegal titulo="Política de privacidade" atualizado="22 de novembro de 2026">
      <p>
        Esta página explica quais dados o Costura Girassol guarda, para quê, e o que nunca guarda. Seguimos a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>

      <h2>O que não guardamos</h2>
      <p>
        O site não pede nem guarda laudo, diagnóstico, CID, dados de saúde ou qualquer informação sobre os filhos das costureiras. A participação no Projeto Girassol é confirmada pela equipe do projeto, fora do site.
      </p>

      <h2>Dados das costureiras</h2>
      <ul>
        <li>Nome, e-mail e senha: para criar e proteger a conta. A senha fica guardada de forma criptografada, e nem a equipe consegue ver.</li>
        <li>WhatsApp: para as clientes entrarem em contato. O número não aparece escrito no site, ele só é usado quando alguém toca em Encomendar.</li>
        <li>Bairro e nome do ateliê: aparecem na vitrine. O endereço completo nunca é pedido.</li>
        <li>Fotos das peças: aparecem na vitrine. O site apaga a localização e outros dados escondidos das fotos antes de enviar.</li>
        <li>A informação sobre como a equipe do Projeto Girassol conhece você só é vista pela administração.</li>
      </ul>

      <h2>Dados de quem compra</h2>
      <p>
        Quem visita o site não precisa criar conta. Quando alguém toca em Encomendar, contamos o clique (sem guardar quem clicou) para mostrar às costureiras e à prefeitura quantos contatos o site gerou.
      </p>

      <h2>Com quem os dados são compartilhados</h2>
      <p>
        Com ninguém, além dos serviços que mantêm o site no ar: Supabase (banco de dados e fotos) e Vercel (hospedagem). A conversa no WhatsApp acontece fora do site.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados. Parte disso você mesma faz no painel do seu ateliê. Para apagar a conta inteira, fale com a coordenação do Projeto Girassol.
      </p>
    </TextoLegal>
  );
}
