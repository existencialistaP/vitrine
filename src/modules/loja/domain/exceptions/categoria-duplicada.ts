import { ConflictError } from "@/kernel/errors/domain-error";

export class CategoriaDuplicada extends ConflictError {
  readonly code = "CATEGORIA_DUPLICADA";

  constructor(categoriaId: string) {
    super(`A categoria ${categoriaId} já está cadastrada na vitrine.`);
  }
}
