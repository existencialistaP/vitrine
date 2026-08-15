import type { ValueObject } from "@/kernel/ddd/value-object";
import { CorHexInvalida } from "../exceptions/cor-hex-invalida";

const HEX_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** Cor em formato hexadecimal (#RGB ou #RRGGBB), normalizada para #RRGGBB. */
export class CorHex implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): CorHex {
    const cor = raw.trim();
    if (!HEX_REGEX.test(cor)) {
      throw new CorHexInvalida(cor);
    }
    if (cor.length === 4) {
      return new CorHex(
        `#${cor[1]}${cor[1]}${cor[2]}${cor[2]}${cor[3]}${cor[3]}`.toUpperCase()
      );
    }
    return new CorHex(cor.toUpperCase());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof CorHex && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
