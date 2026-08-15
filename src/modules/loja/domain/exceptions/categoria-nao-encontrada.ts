import { NotFoundError } from "@/kernel/errors/domain-error";

export class CategoriaNaoEncontrada extends NotFoundError {
  readonly code = "CATEGORIA_NAO_ENCONTRADA";

  constructor(categoriaId: string) {
    super(`A categoria ${categoriaId} não foi encontrada.`);
  }
}
