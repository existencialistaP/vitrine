import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { LojaId } from "@/kernel/ids/loja-id";
import type { ProdutoId } from "@/kernel/ids/produto-id";
import type { Loja } from "../loja";

/** Evento publicado quando um produto é adicionado à vitrine. */
export class ProdutoAdicionado implements DomainEvent {
  readonly occurredOn: Date;

  private constructor(
    readonly lojaId: LojaId,
    readonly produtoId: ProdutoId,
    occurredOn: Date
  ) {
    this.occurredOn = occurredOn;
  }

  static from(loja: Loja, produtoId: ProdutoId): ProdutoAdicionado {
    return new ProdutoAdicionado(loja.getId(), produtoId, new Date());
  }
}
