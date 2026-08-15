import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

/** Estado de disponibilidade de um produto na vitrine. */
export const Disponibilidade = {
  DISPONIVEL: "DISPONIVEL",
  INDISPONIVEL: "INDISPONIVEL",
} as const;

export type Disponibilidade = (typeof Disponibilidade)[keyof typeof Disponibilidade];

export class DisponibilidadeInvalida extends InvalidDomainError {
  readonly code = "DISPONIBILIDADE_INVALIDA";

  constructor(valor?: unknown) {
    super(`A disponibilidade informada é inválida${valor !== undefined ? `: ${String(valor)}` : ""}.`);
  }
}

/** Converte boolean primitivo no objeto de valor (semântica explícita). */
export class DisponibilidadeValue implements ValueObject {
  private readonly value: Disponibilidade;

  private constructor(value: Disponibilidade) {
    this.value = value;
  }

  static disponivel(): DisponibilidadeValue {
    return new DisponibilidadeValue(Disponibilidade.DISPONIVEL);
  }

  static indisponivel(): DisponibilidadeValue {
    return new DisponibilidadeValue(Disponibilidade.INDISPONIVEL);
  }

  static deBoolean(disponivel: boolean): DisponibilidadeValue {
    return disponivel
      ? DisponibilidadeValue.disponivel()
      : DisponibilidadeValue.indisponivel();
  }

  static de(valor: Disponibilidade | boolean): DisponibilidadeValue {
    if (typeof valor === "boolean") return DisponibilidadeValue.deBoolean(valor);
    if (!Object.values(Disponibilidade).includes(valor)) {
      throw new DisponibilidadeInvalida(valor);
    }
    return new DisponibilidadeValue(valor);
  }

  getValue(): Disponibilidade {
    return this.value;
  }

  isDisponivel(): boolean {
    return this.value === Disponibilidade.DISPONIVEL;
  }

  equals(other: unknown): boolean {
    return other instanceof DisponibilidadeValue && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
