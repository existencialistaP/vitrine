import type { ValueObject } from "../ddd/value-object";
import { TelefoneInvalido } from "../errors/telefone-invalido";

const DIGITS_ONLY = /\D/g;

/**
 * Telefone brasileiro (fixo ou móvel). Normalizado para apenas dígitos e
 * validado com base na quantidade de dígitos (DDD + número).
 */
export class Telefone implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): Telefone {
    const digitos = raw.replace(DIGITS_ONLY, "");
    if (digitos.length !== 10 && digitos.length !== 11) {
      throw new TelefoneInvalido(raw);
    }
    return new Telefone(digitos);
  }

  /** Somente dígitos, ex.: 41999998888. */
  getDigitos(): string {
    return this.value;
  }

  /** Formato legível, ex.: (41) 99999-8888. */
  formatar(): string {
    if (this.value.length === 11) {
      return `(${this.value.slice(0, 2)}) ${this.value.slice(2, 7)}-${this.value.slice(7)}`;
    }
    return `(${this.value.slice(0, 2)}) ${this.value.slice(2, 6)}-${this.value.slice(6)}`;
  }

  equals(other: unknown): boolean {
    return other instanceof Telefone && other.value === this.value;
  }

  toString(): string {
    return this.formatar();
  }
}
