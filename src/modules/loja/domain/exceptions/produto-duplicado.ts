import { ConflictError } from "@/kernel/errors/domain-error";

export class ProdutoDuplicado extends ConflictError {
  readonly code = "PRODUTO_DUPLICADO";

  constructor(produtoId: string) {
    super(`O produto ${produtoId} já está cadastrado na vitrine.`);
  }
}
