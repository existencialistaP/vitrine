import { LojaId } from "@/kernel/ids/loja-id";
import { Slug } from "@/modules/loja/domain/vos/slug";
import { VitrineNaoEncontrada } from "./exceptions/vitrine-nao-encontrada";
import type { CatalogoRepository } from "./catalogo-repository";
import type { VitrineCatalogo } from "./dto/catalogo-dto";

/**
 * Serviço de consulta do catálogo público (RF-003). Composto apenas por queries
 * (leitura) — não altera estado e não emite eventos.
 */
export class CatalogoService {
  constructor(private readonly repository: CatalogoRepository) {}

  async listarPorSlug(slug: string): Promise<VitrineCatalogo> {
    const vitrine = await this.repository.buscarVitrinePorSlug(Slug.of(slug));
    if (!vitrine) throw new VitrineNaoEncontrada(`slug "${slug}"`);
    return vitrine;
  }

  async listarPorId(lojaId: string): Promise<VitrineCatalogo> {
    const vitrine = await this.repository.buscarVitrinePorId(LojaId.fromString(lojaId));
    if (!vitrine) throw new VitrineNaoEncontrada(lojaId);
    return vitrine;
  }
}
