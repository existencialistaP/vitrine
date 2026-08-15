import type { LojaId } from "@/kernel/ids/loja-id";
import type { Slug } from "@/modules/loja/domain/vos/slug";
import type { VitrineCatalogo } from "./dto/catalogo-dto";

/**
 * Contrato de leitura do catálogo público (RF-003). A implementação na
 * infraestrutura monta o read-model apenas com vitrines ativas e produtos
 * disponíveis.
 */
export interface CatalogoRepository {
  buscarVitrinePorSlug(slug: Slug): Promise<VitrineCatalogo | null>;

  buscarVitrinePorId(lojaId: LojaId): Promise<VitrineCatalogo | null>;
}
