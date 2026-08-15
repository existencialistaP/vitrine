import { NotFoundError } from "@/kernel/errors/domain-error";

export class ProdutoNaoEncontrado extends NotFoundError {
  readonly code = "PRODUTO_NAO_ENCONTRADO";

  constructor(produtoId: string) {
    super(`O produto ${produtoId} não foi encontrado.`);
  }
}
