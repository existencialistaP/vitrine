import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class CorHexInvalida extends InvalidDomainError {
  readonly code = "COR_HEX_INVALIDA";

  constructor(cor?: unknown) {
    super(`A cor informada é inválida (esperado #RRGGBB)${cor !== undefined ? `: ${String(cor)}` : ""}.`);
  }
}
