import type { LojaId } from "@/kernel/ids/loja-id";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { Loja } from "./loja";
import type { Slug } from "./vos/slug";

/**
 * Contrato de persistência do agregado {@link Loja}. A implementação fica na
 * camada de infraestrutura (Prisma); o domínio e a aplicação dependem apenas
 * desta interface (Dependency Inversion).
 */
export interface LojaRepository {
  /** Persiste a vitrine e seus filhos atomicamente, retornando a versão atualizada. */
  save(loja: Loja): Promise<Loja>;

  findById(id: LojaId): Promise<Loja | null>;

  findBySlug(slug: Slug): Promise<Loja | null>;

  /** Verifica o vínculo de exclusividade lojista → vitrine. */
  findByLojistaId(lojistaId: LojistaId): Promise<Loja | null>;

  existsBySlug(slug: Slug): Promise<boolean>;
}
