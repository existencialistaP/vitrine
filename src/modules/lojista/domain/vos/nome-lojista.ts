import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class NomeLojistaInvalido extends InvalidDomainError {
  readonly code = "NOME_LOJISTA_INVALIDO";

  constructor(motivo: string) {
    super(`O nome do lojista é inválido: ${motivo}.`);
  }
}

const MIN_LENGTH = 3;
const MAX_LENGTH = 120;

/** Nome completo do lojista. */
export class NomeLojista implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): NomeLojista {
    const nome = raw.trim().replace(/\s+/g, " ");
    if (nome.length < MIN_LENGTH) {
      throw new NomeLojistaInvalido(`mínimo de ${MIN_LENGTH} caracteres`);
    }
    if (nome.length > MAX_LENGTH) {
      throw new NomeLojistaInvalido(`máximo de ${MAX_LENGTH} caracteres`);
    }
    return new NomeLojista(nome);
  }

  getValue(): string {
    return this.value;
  }

  getPrimeiroNome(): string {
    return this.value.split(" ")[0] ?? this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof NomeLojista && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
