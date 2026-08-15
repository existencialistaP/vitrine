import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class OrdemInvalida extends InvalidDomainError {
  readonly code = "ORDEM_INVALIDA";

  constructor(motivo: string) {
    super(`A ordem é inválida: ${motivo}.`);
  }
}

/** Posição de ordenação de produtos/categorias dentro da vitrine. */
export class Ordem implements ValueObject {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static of(value: number): Ordem {
    if (!Number.isInteger(value)) {
      throw new OrdemInvalida("deve ser um inteiro");
    }
    if (value < 0) {
      throw new OrdemInvalida("não pode ser negativa");
    }
    return new Ordem(value);
  }

  static primeira(): Ordem {
    return new Ordem(0);
  }

  getValue(): number {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof Ordem && other.value === this.value;
  }

  toString(): string {
    return String(this.value);
  }
}
