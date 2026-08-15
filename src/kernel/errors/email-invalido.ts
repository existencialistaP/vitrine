import { InvalidDomainError } from "./domain-error";

/** E-mail com formato inválido ou fora dos limites aceitos. */
export class EmailInvalido extends InvalidDomainError {
  readonly code = "EMAIL_INVALIDO";

  constructor(email?: unknown) {
    super(
      `O e-mail informado é inválido${email !== undefined ? `: ${String(email)}` : ""}.`
    );
  }
}
