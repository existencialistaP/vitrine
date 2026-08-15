import type { ValueObject } from "@/kernel/ddd/value-object";
import { UrlInvalida } from "../exceptions/url-invalida";

const MAX_LENGTH = 2048;

/**
 * URL de um recurso externo (imagem de produto, logotipo). Validada como
 * endereço http(s) absoluto para evitar injeção de protocolos arbitrários.
 */
export class Url implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): Url {
    const url = raw.trim();
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new UrlInvalida(url);
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new UrlInvalida(url);
    }
    if (url.length > MAX_LENGTH) {
      throw new UrlInvalida(url);
    }
    return new Url(parsed.toString());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof Url && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
