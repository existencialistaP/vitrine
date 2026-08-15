import type { DomainObject } from "./domain-object";

/**
 * Evento de domínio. Representa um fato relevante ocorrido no agregado que
 * precisa ser comunicado ao restante do sistema após a persistência.
 */
export interface DomainEvent extends DomainObject {
  /** Momento em que o evento ocorreu (equivalent a {@code Instant} no Java). */
  readonly occurredOn: Date;
}
