import type { ValueObject } from "@/kernel/ddd/value-object";
import { NomeInvalido } from "../exceptions/nome-invalido";

const MIN_LENGTH = 3;
const MAX_LENGTH = 60;

/** Nome da vitrine (loja). */
export class NomeLoja implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): NomeLoja {
    const nome = raw.trim().replace(/\s+/g, " ");
    if (nome.length < MIN_LENGTH) {
      throw new NomeInvalido("loja", `mínimo de ${MIN_LENGTH} caracteres`);
    }
    if (nome.length > MAX_LENGTH) {
      throw new NomeInvalido("loja", `máximo de ${MAX_LENGTH} caracteres`);
    }
    return new NomeLoja(nome);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof NomeLoja && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
