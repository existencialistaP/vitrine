import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class DescricaoInvalida extends InvalidDomainError {
  readonly code = "DESCRICAO_INVALIDA";

  constructor(motivo: string) {
    super(`A descrição é inválida: ${motivo}.`);
  }
}
