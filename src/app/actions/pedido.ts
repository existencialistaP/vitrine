"use server"

import { PedidoService } from "@/modules/pedido/application/pedido-service"
import { Quantidade } from "@/modules/pedido/domain/vos/quantidade"
import { NomeLoja } from "@/modules/loja/domain/vos/nome-loja"
import { NomeProduto } from "@/modules/loja/domain/vos/nome-produto"
import { Preco } from "@/modules/loja/domain/vos/preco"
import { Whatsapp } from "@/modules/loja/domain/vos/whatsapp"
import { ProdutoId } from "@/kernel/ids/produto-id"

export type PedidoResultado = {
  texto: string
  linkWhatsapp: string
  totalCents: number
}

/** Formata o pedido e gera o link wa.me (RF-005). */
export async function formatarPedidoAction(input: {
  lojaNome: string
  whatsapp: string
  itens: { id: string; nome: string; quantidade: number; precoCents: number }[]
  observacao?: string
}): Promise<PedidoResultado> {
  const service = new PedidoService()

  const resultado = service.formatarPedido({
    lojaNome: NomeLoja.of(input.lojaNome),
    whatsapp: Whatsapp.of(input.whatsapp),
    itens: input.itens.map((item) => ({
      produtoId: ProdutoId.fromString(item.id),
      nome: NomeProduto.of(item.nome),
      preco: Preco.of(item.precoCents),
      quantidade: Quantidade.of(item.quantidade),
    })),
    observacao: input.observacao,
  })

  return {
    texto: resultado.texto,
    linkWhatsapp: resultado.linkWhatsapp,
    totalCents: resultado.total.getCents(),
  }
}
