import type { DomainObject } from "./domain-object";

/**
 * Objeto de domínio concorrente. Utiliza controle de concorrência otimista
 * (lock otimista) para evitar que duas sessões atualizem o mesmo objeto
 * simultaneamente (equivalent ao {@code @Version} do JPA).
 */
export interface ConcurrentDomainObject extends DomainObject {
  /** Versão de concorrência otimista, ou {@code null} se ainda não persistido. */
  getVersion(): number | null;

  /** Incrementa a versão ao concluir uma alteração persistida. */
  bumpVersion(): void;
}
