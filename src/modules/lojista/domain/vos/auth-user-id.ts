import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class AuthUserIdInvalido extends InvalidDomainError {
  readonly code = "AUTH_USER_ID_INVALIDO";

  constructor(authUserId?: unknown) {
    super(`O identificador de autenticação é inválido${authUserId !== undefined ? `: ${String(authUserId)}` : ""}.`);
  }
}

/**
 * Identificador do usuário autenticado no serviço de identidade externo
 * (Supabase Auth). Guarda a referência entre o perfil de domínio (Lojista) e a
 * credencial de acesso.
 */
export class AuthUserId implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static of(raw: string): AuthUserId {
    const valor = raw.trim();
    if (valor.length === 0) {
      throw new AuthUserIdInvalido(valor);
    }
    return new AuthUserId(valor);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof AuthUserId && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
