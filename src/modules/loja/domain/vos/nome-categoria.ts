import type { ValueObject } from "@/kernel/ddd/value-object";
import { NomeInvalido } from "../exceptions/nome-invalido";

const MIN_LENGTH = 2;
const MAX_LENGTH = 40;

/** Nome de uma categoria de produtos. */
export class NomeCategoria implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): NomeCategoria {
    const nome = raw.trim().replace(/\s+/g, " ");
    if (nome.length < MIN_LENGTH) {
      throw new NomeInvalido("categoria", `mínimo de ${MIN_LENGTH} caracteres`);
    }
    if (nome.length > MAX_LENGTH) {
      throw new NomeInvalido("categoria", `máximo de ${MAX_LENGTH} caracteres`);
    }
    return new NomeCategoria(nome);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof NomeCategoria && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
