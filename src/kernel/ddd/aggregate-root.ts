import type { DomainObjectId } from "./domain-object-id";
import type { DomainEvent } from "./domain-event";
import { Entity } from "./entity";

/**
 * Raiz de agregado (equivalent ao {@code AbstractAggregateRoot}).
 *
 * É a única porta de entrada para as entidades de seu agregado: garante os
 * invariantes do conjunto e registra eventos de domínio a serem publicados
 * após a persistência.
 */
export abstract class AggregateRoot<ID extends DomainObjectId> extends Entity<ID> {
  private readonly domainEvents: DomainEvent[] = [];

  protected constructor(id: ID, version: number | null = null) {
    super(id, version);
  }

  /**
   * Registra um evento de domínio a ser publicado quando o agregado for
   * persistido (equivalent ao {@code registerEvent} do Java).
   */
  protected registerEvent(event: DomainEvent): void {
    if (event === null || event === undefined) {
      throw new Error("event must not be null");
    }
    this.domainEvents.push(event);
  }

  /** Retorna os eventos registrados sem consumi-los (leitura). */
  getRegisteredEvents(): readonly DomainEvent[] {
    return Object.freeze([...this.domainEvents]);
  }

  /**
   * Retorna e limpa os eventos registrados. Deve ser chamado pela
   * infraestrutura após a persistência para despachá-los.
   */
  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }
}
