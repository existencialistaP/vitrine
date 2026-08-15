import { ConflictError } from "@/kernel/errors/domain-error";

export class SlugJaEmUso extends ConflictError {
  readonly code = "SLUG_JA_EM_USO";

  constructor(slug: string) {
    super(`O endereço "${slug}" já está em uso por outra loja.`);
  }
}
