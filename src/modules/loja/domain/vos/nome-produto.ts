import type { ValueObject } from "@/kernel/ddd/value-object";
import { NomeInvalido } from "../exceptions/nome-invalido";

const MIN_LENGTH = 2;
const MAX_LENGTH = 80;

/** Nome de um produto. */
export class NomeProduto implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): NomeProduto {
    const nome = raw.trim().replace(/\s+/g, " ");
    if (nome.length < MIN_LENGTH) {
      throw new NomeInvalido("produto", `mínimo de ${MIN_LENGTH} caracteres`);
    }
    if (nome.length > MAX_LENGTH) {
      throw new NomeInvalido("produto", `máximo de ${MAX_LENGTH} caracteres`);
    }
    return new NomeProduto(nome);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof NomeProduto && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
