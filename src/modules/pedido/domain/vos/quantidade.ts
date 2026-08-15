import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class QuantidadeInvalida extends InvalidDomainError {
  readonly code = "QUANTIDADE_INVALIDA";

  constructor(motivo: string) {
    super(`A quantidade é inválida: ${motivo}.`);
  }
}

/** Quantidade de um item no pedido (inteiro positivo). */
export class Quantidade implements ValueObject {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static of(value: number): Quantidade {
    if (!Number.isInteger(value)) {
      throw new QuantidadeInvalida("deve ser um inteiro");
    }
    if (value < 1) {
      throw new QuantidadeInvalida("deve ser maior que zero");
    }
    return new Quantidade(value);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof Quantidade && other.value === this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
