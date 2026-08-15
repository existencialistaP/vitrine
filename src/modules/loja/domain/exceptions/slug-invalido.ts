import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class SlugInvalido extends InvalidDomainError {
  readonly code = "SLUG_INVALIDO";

  constructor(motivo: string) {
    super(`O slug é inválido: ${motivo}.`);
  }
}
