import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class UrlInvalida extends InvalidDomainError {
  readonly code = "URL_INVALIDA";

  constructor(url?: unknown) {
    super(`A URL informada é inválida${url !== undefined ? `: ${String(url)}` : ""}.`);
  }
}
