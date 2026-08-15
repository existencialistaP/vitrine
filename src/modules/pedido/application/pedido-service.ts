import type { NomeLoja } from "@/modules/loja/domain/vos/nome-loja";
import type { Whatsapp } from "@/modules/loja/domain/vos/whatsapp";
import { Preco } from "@/modules/loja/domain/vos/preco";
import { Descricao } from "@/modules/loja/domain/vos/descricao";
import type { ItemPedido, PedidoFormatado } from "./dto/pedido-dto";

/**
 * Serviço de aplicação do pedido. Monta o resumo do pedido e gera o link direto
 * para o WhatsApp do lojista (RF-005) — fechamento sem carrinho persistido,
 * apenas formatação e encaminhamento.
 */
export class PedidoService {
  constructor() {}

  formatarPedido(params: {
    lojaNome: NomeLoja;
    whatsapp: Whatsapp;
    itens: readonly ItemPedido[];
    observacao?: string;
  }): PedidoFormatado {
    const linhas = params.itens.map((item) => {
      const quantidade = item.quantidade.getValue();
      const subtotal = Preco.of(item.preco.getCents() * quantidade);
      return `${quantidade}x ${item.nome.getValue()} — ${subtotal.formatarBRL()}`;
    });

    const total = Preco.of(
      params.itens.reduce(
        (soma, item) => soma + item.preco.getCents() * item.quantidade.getValue(),
        0
      )
    );

    const observacao = params.observacao
      ? `\n\nObservações:\n${Descricao.of(params.observacao).getValue()}`
      : "";

    const texto = [
      `*Pedido — ${params.lojaNome.getValue()}*`,
      "",
      ...linhas,
      "",
      `*Total: ${total.formatarBRL()}*`,
      observacao,
    ].join("\n");

    return {
      texto,
      linkWhatsapp: `${params.whatsapp.getLink()}?text=${encodeURIComponent(texto)}`,
      total,
    };
  }
}
