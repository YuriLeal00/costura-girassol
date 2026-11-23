import type { Metadata } from "next";
import { TextoLegal } from "@/components/texto-legal";

export const metadata: Metadata = { title: "Termos de uso" };

// REVISAR: texto de base para um projeto academico. Antes de uso oficial pela prefeitura,
// vale passar pela assessoria juridica do municipio.
export default function Termos() {
  return (
    <TextoLegal titulo="Termos de uso" atualizado="22 de novembro de 2026">
      <p>
        O Costura Girassol é uma vitrine gratuita criada por estudantes da Unifor em parceria com o Projeto Girassol. Ao usar o site, você concorda com as regras abaixo.
      </p>

      <h2>O que o site é</h2>
      <p>
        O site mostra peças de costura feitas por mães que participam do Projeto Girassol e põe quem compra em contato com elas pelo WhatsApp. O site não vende nada, não recebe pagamentos e não cobra comissão.
      </p>

      <h2>Compras e encomendas</h2>
      <p>
        Preço final, prazo, forma de pagamento, entrega, troca e devolução são combinados direto entre a cliente e a costureira. O Costura Girassol não participa da negociação e não responde por ela.
      </p>

      <h2>Quem pode vender</h2>
      <ul>
        <li>Só mães que participam do Projeto Girassol. A equipe do projeto confirma cada cadastro antes de liberar o ateliê.</li>
        <li>As informações do cadastro precisam ser verdadeiras.</li>
        <li>Cada costureira cuida da própria conta e não deve compartilhar a senha.</li>
      </ul>

      <h2>O que pode ser publicado</h2>
      <ul>
        <li>Peças de costura e serviços de costura feitos pela própria costureira.</li>
        <li>Fotos das peças. Evite mostrar rosto de criança, documentos ou o endereço da sua casa.</li>
        <li>Não é permitido publicar conteúdo ofensivo, produtos de terceiros ou anúncios que não sejam de costura.</li>
      </ul>
      <p>A equipe pode tirar da vitrine qualquer peça que não siga essas regras e pausar ateliês quando for preciso.</p>

      <h2>Contato</h2>
      <p>Dúvidas sobre o site podem ser enviadas à coordenação do Projeto Girassol.</p>
    </TextoLegal>
  );
}
