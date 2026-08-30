import type { PrismaClient, Prisma } from "@/generated/prisma/client";
import { LojaId } from "@/kernel/ids/loja-id";
import { ProdutoId } from "@/kernel/ids/produto-id";
import { CategoriaId } from "@/kernel/ids/categoria-id";
import { NomeLoja } from "@/modules/loja/domain/vos/nome-loja";
import { NomeProduto } from "@/modules/loja/domain/vos/nome-produto";
import { NomeCategoria } from "@/modules/loja/domain/vos/nome-categoria";
import { Descricao } from "@/modules/loja/domain/vos/descricao";
import { Slug } from "@/modules/loja/domain/vos/slug";
import { Whatsapp } from "@/modules/loja/domain/vos/whatsapp";
import { Preco } from "@/modules/loja/domain/vos/preco";
import { Ordem } from "@/modules/loja/domain/vos/ordem";
import { Url } from "@/modules/loja/domain/vos/url";
import { Fonte, parseFonte } from "@/modules/loja/domain/vos/fonte";
import { IdentidadeVisual } from "@/modules/loja/domain/vos/identidade-visual";
import { Experiencia } from "@/modules/loja/domain/vos/experiencia";
import type { CatalogoRepository } from "../application/catalogo-repository";
import type { VitrineCatalogo } from "../application/dto/catalogo-dto";

type LinhaVitrine = Prisma.LojaGetPayload<{
  include: {
    produtos: { where: { disponivel: true }; orderBy: { ordem: "asc" } };
    categorias: { orderBy: { ordem: "asc" } };
  };
}>;

/**
 * Implementação Prisma do {@link CatalogoRepository}. Monta o read-model público
 * apenas com vitrines ativas e produtos disponíveis (RF-003).
 */
export class PrismaCatalogoRepository implements CatalogoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async buscarVitrinePorSlug(slug: Slug): Promise<VitrineCatalogo | null> {
    const linha = await this.prisma.loja.findFirst({
      where: { slug: slug.getValue(), status: "ATIVA" },
      include: {
        produtos: {
          where: { disponivel: true },
          orderBy: { ordem: "asc" },
        },
        categorias: {
          orderBy: { ordem: "asc" },
        },
      },
    });
    return linha ? this.map(linha) : null;
  }

  async buscarVitrinePorId(lojaId: LojaId): Promise<VitrineCatalogo | null> {
    const linha = await this.prisma.loja.findFirst({
      where: { id: lojaId.toUUID(), status: "ATIVA" },
      include: {
        produtos: {
          where: { disponivel: true },
          orderBy: { ordem: "asc" },
        },
        categorias: {
          orderBy: { ordem: "asc" },
        },
      },
    });
    return linha ? this.map(linha) : null;
  }

  private map(linha: LinhaVitrine): VitrineCatalogo {
    return {
      lojaId: LojaId.fromString(linha.id),
      nome: NomeLoja.of(linha.nome),
      slug: Slug.of(linha.slug),
      descricao: Descricao.of(linha.descricao ?? ""),
      whatsapp: Whatsapp.of(linha.whatsapp),
      tema: IdentidadeVisual.of({
        paleta: linha.temaPaleta,
        estilo: linha.temaEstilo,
        formatoCard: linha.temaFormatoCard,
        layout: linha.temaLayout,
        fonte: parseFonte(linha.temaFonte) ?? Fonte.SANS,
        logoUrl: linha.temaLogoUrl !== null ? Url.of(linha.temaLogoUrl) : null,
      }),
      experiencia: Experiencia.deJson(linha.experiencia),
      categorias: linha.categorias.map((c) => ({
        categoriaId: CategoriaId.fromString(c.id),
        nome: NomeCategoria.of(c.nome),
        ordem: Ordem.of(c.ordem),
      })),
      produtos: linha.produtos.map((p) => ({
        produtoId: ProdutoId.fromString(p.id),
        nome: NomeProduto.of(p.nome),
        descricao: Descricao.of(p.descricao ?? ""),
        preco: Preco.of(p.precoCents),
        imagemUrl: p.imagemUrl !== null ? Url.of(p.imagemUrl) : null,
        categoriaId: p.categoriaId !== null ? CategoriaId.fromString(p.categoriaId) : null,
        ordem: Ordem.of(p.ordem),
      })),
    };
  }
}
