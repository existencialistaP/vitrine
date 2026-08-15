import type { DomainObject } from "./domain-object";

/**
 * Value Object (Objeto de Valor).
 *
 * Representa um conceito do domínio cuja identidade é definida por seu valor
 * (e não por um ID). Deve ser imutável, auto-validado na criação e comparado
 * estruturalmente.
 */
export interface ValueObject extends DomainObject {
  equals(other: unknown): boolean;
}
