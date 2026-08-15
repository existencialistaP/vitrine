import { NotFoundError } from "@/kernel/errors/domain-error";

export class LojaNaoEncontrada extends NotFoundError {
  readonly code = "LOJA_NAO_ENCONTRADA";

  constructor(identificador: string) {
    super(`Nenhuma loja encontrada para ${identificador}.`);
  }
}
