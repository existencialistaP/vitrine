import { InvalidDomainError } from "@/kernel/errors/domain-error";

/** Erro quando um identificador de combo visual (paleta/estilo/etc.) é inválido. */
export class OpcaoVisualInvalida extends InvalidDomainError {
  readonly code = "OPCAO_VISUAL_INVALIDA";

  constructor(tipo: string, valor: unknown) {
    super(`${tipo} inválido: ${String(valor)}.`);
  }
}
