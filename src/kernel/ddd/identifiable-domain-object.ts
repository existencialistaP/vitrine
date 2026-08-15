import type { DomainObject } from "./domain-object";

/**
 * Objeto de domínio identificável. Qualquer entidade ou agregado possui uma
 * identidade única expressa por um {@link DomainObjectId}.
 */
export interface IdentifiableDomainObject<ID> extends DomainObject {
  getId(): ID;
}
