import { NotFoundError } from "@/kernel/errors/domain-error";

export class LojistaNaoEncontrado extends NotFoundError {
  readonly code = "LOJISTA_NAO_ENCONTRADO";

  constructor(identificador: string) {
    super(`Nenhum lojista encontrado para ${identificador}.`);
  }
}
