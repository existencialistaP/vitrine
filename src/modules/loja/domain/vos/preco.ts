import type { ValueObject } from "@/kernel/ddd/value-object";
import { PrecoInvalido } from "../exceptions/preco-invalido";

/**
 * Preço em centavos (inteiro, não negativo). Evita problemas de aritmética de
 * ponto flutuante e garante consistência monetária em todo o domínio.
 */
export class Preco implements ValueObject {
  private readonly cents: number;

  private constructor(cents: number) {
    this.cents = cents;
  }

  static of(cents: number): Preco {
    if (!Number.isSafeInteger(cents)) {
      throw new PrecoInvalido("deve ser um valor inteiro");
    }
    if (cents < 0) {
      throw new PrecoInvalido("não pode ser negativo");
    }
    return new Preco(cents);
  }

  static zero(): Preco {
    return new Preco(0);
  }

  getCents(): number {
    return this.cents;
  }

  /** Valor em reais com duas casas (ex.: R$ 12,34). */
  formatarBRL(): string {
    const valor = (this.cents / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return valor.replace(/\u00A0/g, " ");
  }

  equals(other: unknown): boolean {
    return other instanceof Preco && other.cents === this.cents;
  }

  toString(): string {
    return this.formatarBRL();
  }
}
