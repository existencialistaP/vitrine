import type { ProdutoId } from "@/kernel/ids/produto-id";
import type { NomeProduto } from "@/modules/loja/domain/vos/nome-produto";
import type { Preco } from "@/modules/loja/domain/vos/preco";
import type { Quantidade } from "@/modules/pedido/domain/vos/quantidade";

/**
 * Item selecionado pelo cliente no catálogo, com quantidade. O preço é capturado
 * da vitrine no momento da seleção (snapshot), evitando alterações futuras de
 * preço no pedido enviado.
 */
export interface ItemPedido {
  readonly produtoId: ProdutoId;
  readonly nome: NomeProduto;
  readonly preco: Preco;
  readonly quantidade: Quantidade;
}

/** Pedido formatado e pronto para envio via WhatsApp (RF-005). */
export interface PedidoFormatado {
  /** Texto da mensagem do pedido. */
  readonly texto: string;
  /** Link wa.me com o texto pré-preenchido. */
  readonly linkWhatsapp: string;
  readonly total: Preco;
}
