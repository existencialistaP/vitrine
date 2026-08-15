import type { ValueObject } from "../ddd/value-object";
import { EmailInvalido } from "../errors/email-invalido";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;

/**
 * Endereço de e-mail. Normalizado em caixa baixa e validado no momento da
 * criação para garantir consistência em todo o domínio.
 */
export class Email implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /** Cria um {@link Email} validando formato e tamanho. */
  static of(raw: string): Email {
    const email = raw.trim().toLowerCase();
    if (email.length === 0 || email.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(email)) {
      throw new EmailInvalido(raw);
    }
    return new Email(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof Email && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
