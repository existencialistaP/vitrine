import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class PrecoInvalido extends InvalidDomainError {
  readonly code = "PRECO_INVALIDO";

  constructor(motivo: string) {
    super(`O preço é inválido: ${motivo}.`);
  }
}
