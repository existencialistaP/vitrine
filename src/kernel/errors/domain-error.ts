/**
 * Erro de domínio base. Todos os erros originados na camada de domínio devem
 * estender esta classe, carregando um código estável para mapeamento HTTP e
 * uma mensagem no idioma do negócio.
 */
export abstract class DomainError extends Error {
  /** Código canônico do erro (usado na resposta da API). */
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Erro quando uma entidade/agregado exigido não foi encontrado. */
export abstract class NotFoundError extends DomainError {}

/** Erro quando uma operação conflita com o estado atual do domínio. */
export abstract class ConflictError extends DomainError {}

/** Erro de validação de invariante de domínio (valor inválido). */
export abstract class InvalidDomainError extends DomainError {}
