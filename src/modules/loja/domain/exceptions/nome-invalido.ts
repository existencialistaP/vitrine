import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class NomeInvalido extends InvalidDomainError {
  readonly code = "NOME_INVALIDO";

  constructor(campo: string, motivo: string) {
    super(`O nome de ${campo} é inválido: ${motivo}.`);
  }
}
