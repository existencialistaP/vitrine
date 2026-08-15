import { NotFoundError } from "@/kernel/errors/domain-error";

export class VitrineNaoEncontrada extends NotFoundError {
  readonly code = "VITRINE_NAO_ENCONTRADA";

  constructor(identificador: string) {
    super(`A vitrine ${identificador} não está disponível.`);
  }
}
