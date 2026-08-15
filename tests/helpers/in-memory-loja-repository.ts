import type { LojaId } from "@/kernel/ids/loja-id";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { LojaRepository } from "@/modules/loja/domain/loja-repository";
import type { Loja } from "@/modules/loja/domain/loja";
import type { Slug } from "@/modules/loja/domain/vos/slug";

/**
 * Fake em memória do {@link LojaRepository} para testes de aplicação (sem banco).
 */
export class InMemoryLojaRepository implements LojaRepository {
  private readonly dados = new Map<string, Loja>();

  async save(loja: Loja): Promise<Loja> {
    const copia = loja;
    this.dados.set(loja.getId().toUUID(), copia);
    return copia;
  }

  async findById(id: LojaId): Promise<Loja | null> {
    return this.dados.get(id.toUUID()) ?? null;
  }

  async findBySlug(slug: Slug): Promise<Loja | null> {
    for (const loja of this.dados.values()) {
      if (loja.getSlug().equals(slug)) return loja;
    }
    return null;
  }

  async findByLojistaId(lojistaId: LojistaId): Promise<Loja | null> {
    for (const loja of this.dados.values()) {
      if (loja.getLojistaId().equals(lojistaId)) return loja;
    }
    return null;
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    for (const loja of this.dados.values()) {
      if (loja.getSlug().equals(slug)) return true;
    }
    return false;
  }

  get size(): number {
    return this.dados.size;
  }
}
