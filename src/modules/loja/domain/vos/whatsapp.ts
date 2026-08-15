import type { ValueObject } from "@/kernel/ddd/value-object";
import { WhatsappInvalido } from "../exceptions/whatsapp-invalido";

const BRASIL = "55";

/**
 * WhatsApp do lojista. Guarda o número no formato E.164 (código do país 55 +
 * DDD + número) e expõe utilitários para o link direto {@code wa.me}.
 */
export class Whatsapp implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): Whatsapp {
    const digitos = raw.replace(/\D/g, "");
    const semDddPais = digitos.startsWith(BRASIL) && digitos.length > 11 ? digitos.slice(2) : digitos;

    if (semDddPais.length !== 10 && semDddPais.length !== 11) {
      throw new WhatsappInvalido("número deve conter DDD + número");
    }
    return new Whatsapp(`${BRASIL}${semDddPais}`);
  }

  /** Número em formato E.164 (somente dígitos), ex.: 5541999998888. */
  getE164(): string {
    return this.value;
  }

  /** Link direto de conversa: https://wa.me/5541999998888 */
  getLink(): string {
    return `https://wa.me/${this.value}`;
  }

  equals(other: unknown): boolean {
    return other instanceof Whatsapp && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
