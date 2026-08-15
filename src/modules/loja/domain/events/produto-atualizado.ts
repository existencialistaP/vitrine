import type { DomainEvent } from "@/kernel/ddd/domain-event";
import type { LojaId } from "@/kernel/ids/loja-id";
import type { ProdutoId } from "@/kernel/ids/produto-id";
import type { Loja } from "../loja";

/** Evento publicado quando um produto existente é alterado. */
export class ProdutoAtualizado implements DomainEvent {
  readonly occurredOn: Date;

  private constructor(
    readonly lojaId: LojaId,
    readonly produtoId: ProdutoId,
    occurredOn: Date
  ) {
    this.occurredOn = occurredOn;
  }

  static from(loja: Loja, produtoId: ProdutoId): ProdutoAtualizado {
    return new ProdutoAtualizado(loja.getId(), produtoId, new Date());
  }
}
