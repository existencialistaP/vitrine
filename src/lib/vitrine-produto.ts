import { NotFoundError } from "@/kernel/errors/domain-error";

/**
 * Classifica erros da vitrine (spec RF-A7): somente "não encontrado" vira 404;
 * qualquer outra falha de infraestrutura deve propagar para o boundary de erro.
 */
export function ehNaoEncontrado(erro: unknown): boolean {
  return erro instanceof NotFoundError;
}

/** Localiza um produto do catálogo serializado pelo id (UUID da URL). */
export function selecionarProduto<T extends { id: string }>(
  produtos: readonly T[],
  id: string
): T | null {
  return produtos.find((produto) => produto.id === id) ?? null;
}
