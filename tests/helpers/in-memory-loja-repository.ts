import type { LojaId } from "@/kernel/ids/loja-id";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { LojaRepository } from "@/modules/loja/domain/loja-repository";
import type { Loja } from "@/modules/loja/domain/loja";
import type { Slug } from "@/modules/loja/domain/vos/slug";
import { DadosDesatualizados } from "@/modules/loja/domain/exceptions/dados-desatualizados";

/**
 * Fake em memória do {@link LojaRepository} para testes de aplicação (sem banco).
 */
export class InMemoryLojaRepository implements LojaRepository {
  private readonly dados = new Map<string, Loja>();
  private readonly versoes = new Map<string, number>();

  /** Cópia defensiva para o fake de conflito de versão. */
  constructor(
    origem?: InMemoryLojaRepository | Map<string, Loja>,
    versoes?: Map<string, number>
  ) {
    const mapaLojas =
      origem instanceof InMemoryLojaRepository ? origem.obterMapa() : origem ?? new Map<string, Loja>();
    mapaLojas.forEach((loja, id) => this.dados.set(id, loja));
    if (versoes) versoes.forEach((v, id) => this.versoes.set(id, v));
  }

  /** Mapa interno (mesmas referências) para fakes derivados. */
  obterMapa(): Map<string, Loja> {
    return this.dados;
  }

  async save(loja: Loja): Promise<Loja> {
    const id = loja.getId().toUUID();
    // Espelha PrismaLojaRepository.save: cada gravação avança a versão, de modo
    // que o mapa interno e loja.getVersion() permaneçam em sincronia.
    loja.bumpVersion();
    this.dados.set(id, loja);
    this.versoes.set(id, loja.getVersion() ?? this.versoes.get(id) ?? 1);
    return loja;
  }

  private travarVersao(loja: Loja): void {
    const id = loja.getId().toUUID();
    const atual = this.versoes.get(id) ?? loja.getVersion() ?? 1;
    if (loja.getVersion() !== null && loja.getVersion() !== atual) {
      throw new DadosDesatualizados("loja");
    }
  }

  async atualizarExperiencia(loja: Loja): Promise<void> {
    this.travarVersao(loja);
    const id = loja.getId().toUUID();
    this.dados.set(id, loja);
    this.versoes.set(id, (this.versoes.get(id) ?? loja.getVersion() ?? 0) + 1);
    loja.bumpVersion();
  }

  async atualizarTema(loja: Loja): Promise<void> {
    this.travarVersao(loja);
    const id = loja.getId().toUUID();
    this.dados.set(id, loja);
    this.versoes.set(id, (this.versoes.get(id) ?? loja.getVersion() ?? 0) + 1);
    loja.bumpVersion();
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
