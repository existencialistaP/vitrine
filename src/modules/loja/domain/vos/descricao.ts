import type { ValueObject } from "@/kernel/ddd/value-object";
import { DescricaoInvalida } from "../exceptions/descricao-invalida";

const MAX_LENGTH = 500;

/**
 * Descrição livre (da loja ou de um produto). Pode ser vazia para representar
 * ausência de texto, mas respeita um limite máximo.
 */
export class Descricao implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): Descricao {
    const texto = raw.trim().replace(/\s+/g, " ");
    if (texto.length > MAX_LENGTH) {
      throw new DescricaoInvalida(`máximo de ${MAX_LENGTH} caracteres`);
    }
    return new Descricao(texto);
  }

  /** Descrição vazia (sem conteúdo). */
  static vazia(): Descricao {
    return new Descricao("");
  }

  getValue(): string {
    return this.value;
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  equals(other: unknown): boolean {
    return other instanceof Descricao && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
