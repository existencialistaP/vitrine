import { ConflictError } from "@/kernel/errors/domain-error";

export class LojistaJaPossuiVitrine extends ConflictError {
  readonly code = "LOJISTA_JA_POSSUI_VITRINE";

  constructor(lojistaId: string) {
    super(`O lojista ${lojistaId} já possui uma vitrine cadastrada.`);
  }
}
