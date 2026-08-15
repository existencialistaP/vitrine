import { ConflictError } from "@/kernel/errors/domain-error";

/** Concorrência otimista: o agregado foi alterado por outra operação. */
export class DadosDesatualizados extends ConflictError {
  readonly code = "DADOS_DESATUALIZADOS";

  constructor(entidade: string) {
    super(`Os dados de ${entidade} foram alterados por outra operação. Atualize e tente novamente.`);
  }
}
