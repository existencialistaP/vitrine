import { InvalidDomainError } from "./domain-error";

/** Telefone com formato inválido. */
export class TelefoneInvalido extends InvalidDomainError {
  readonly code = "TELEFONE_INVALIDO";

  constructor(telefone?: string) {
    super(
      `O telefone informado é inválido${telefone !== undefined ? `: ${telefone}` : ""}.`
    );
  }
}
