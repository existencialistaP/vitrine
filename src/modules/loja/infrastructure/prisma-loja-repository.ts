import type { PrismaClient, Prisma } from "@/generated/prisma/client";
import { LojaId } from "@/kernel/ids/loja-id";
import { LojistaId } from "@/kernel/ids/lojista-id";
import { ProdutoId } from "@/kernel/ids/produto-id";
import { CategoriaId } from "@/kernel/ids/categoria-id";
import { SlugJaEmUso } from "../domain/exceptions/slug-ja-em-uso";
import { LojistaJaPossuiVitrine } from "../domain/exceptions/lojista-ja-possui-vitrine";
import { DadosDesatualizados } from "../domain/exceptions/dados-desatualizados";
import type { LojaRepository } from "../domain/loja-repository";
import { Loja } from "../domain/loja";
import { Produto } from "../domain/produto";
import { Categoria } from "../domain/categoria";
import { NomeLoja } from "../domain/vos/nome-loja";
import { NomeProduto } from "../domain/vos/nome-produto";
import { NomeCategoria } from "../domain/vos/nome-categoria";
import { Descricao } from "../domain/vos/descricao";
import { Slug } from "../domain/vos/slug";
import { Whatsapp } from "../domain/vos/whatsapp";
import { Preco } from "../domain/vos/preco";
import { Ordem } from "../domain/vos/ordem";
import { Url } from "../domain/vos/url";
import { Fonte, parseFonte } from "../domain/vos/fonte";
import { IdentidadeVisual } from "../domain/vos/identidade-visual";
import { DisponibilidadeValue } from "../domain/vos/disponibilidade";

type LinhaLoja = Prisma.LojaGetPayload<{
  include: { produtos: true; categorias: true };
}>;

/**
 * Implementação Prisma do {@link LojaRepository}.
 *
 * Persiste a vitrine e seus filhos (produtos/categorias) atomicamente dentro de
 * uma transação e implementa concorrência otimista via coluna {@code versao}
 * (equivalent ao {@code @Version} do JPA).
 */
export class PrismaLojaRepository implements LojaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(loja: Loja): Promise<Loja> {
    await this.prisma.$transaction(async (tx) => {
      await this.persistirLoja(tx, loja);
      await this.sincronizarCategorias(tx, loja);
      await this.sincronizarProdutos(tx, loja);
    });

    loja.bumpVersion();
    return loja;
  }

  async findById(id: LojaId): Promise<Loja | null> {
    const linha = await this.prisma.loja.findUnique({
      where: { id: id.toUUID() },
      include: { produtos: true, categorias: true },
    });
    return linha ? this.map(linha) : null;
  }

  async findBySlug(slug: Slug): Promise<Loja | null> {
    const linha = await this.prisma.loja.findUnique({
      where: { slug: slug.getValue() },
      include: { produtos: true, categorias: true },
    });
    return linha ? this.map(linha) : null;
  }

  async findByLojistaId(lojistaId: LojistaId): Promise<Loja | null> {
    const linha = await this.prisma.loja.findUnique({
      where: { lojistaId: lojistaId.toUUID() },
      include: { produtos: true, categorias: true },
    });
    return linha ? this.map(linha) : null;
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    const linha = await this.prisma.loja.findUnique({
      where: { slug: slug.getValue() },
      select: { id: true },
    });
    return linha !== null;
  }

  private async persistirLoja(
    tx: Prisma.TransactionClient,
    loja: Loja
  ): Promise<void> {
    const dados = this.dadosParaLinha(loja);
    const versaoAtual = loja.getVersion();

    try {
      if (versaoAtual === null) {
        await tx.loja.create({ data: dados });
        return;
      }

      const resultado = await tx.loja.updateMany({
        where: { id: loja.getId().toUUID(), versao: versaoAtual },
        data: { ...dados, versao: { increment: 1 } },
      });
      if (resultado.count !== 1) {
        throw new DadosDesatualizados("loja");
      }
    } catch (erro) {
      throw this.mapearErroDePersistencia(erro);
    }
  }

  private async sincronizarCategorias(
    tx: Prisma.TransactionClient,
    loja: Loja
  ): Promise<void> {
    const lojaId = loja.getId().toUUID();
    const idsAtuais = new Set(
      loja.getCategorias().map((c) => c.getId().toUUID())
    );

    await tx.categoria.deleteMany({
      where: { lojaId, id: { notIn: [...idsAtuais] } },
    });

    for (const categoria of loja.getCategorias()) {
      await tx.categoria.upsert({
        where: { id: categoria.getId().toUUID() },
        create: {
          id: categoria.getId().toUUID(),
          lojaId,
          nome: categoria.getNome().getValue(),
          ordem: categoria.getOrdem().getValue(),
        },
        update: {
          nome: categoria.getNome().getValue(),
          ordem: categoria.getOrdem().getValue(),
        },
      });
    }
  }

  private async sincronizarProdutos(
    tx: Prisma.TransactionClient,
    loja: Loja
  ): Promise<void> {
    const lojaId = loja.getId().toUUID();
    const idsAtuais = new Set(
      loja.getProdutos().map((p) => p.getId().toUUID())
    );

    await tx.produto.deleteMany({
      where: { lojaId, id: { notIn: [...idsAtuais] } },
    });

    for (const produto of loja.getProdutos()) {
      await tx.produto.upsert({
        where: { id: produto.getId().toUUID() },
        create: {
          id: produto.getId().toUUID(),
          lojaId,
          categoriaId: produto.getCategoriaId()?.toUUID() ?? null,
          nome: produto.getNome().getValue(),
          descricao: produto.getDescricao().isEmpty()
            ? null
            : produto.getDescricao().getValue(),
          precoCents: produto.getPreco().getCents(),
          imagemUrl: produto.getImagemUrl()?.getValue() ?? null,
          disponivel: produto.getDisponibilidade().isDisponivel(),
          ordem: produto.getOrdem().getValue(),
        },
        update: {
          categoriaId: produto.getCategoriaId()?.toUUID() ?? null,
          nome: produto.getNome().getValue(),
          descricao: produto.getDescricao().isEmpty()
            ? null
            : produto.getDescricao().getValue(),
          precoCents: produto.getPreco().getCents(),
          imagemUrl: produto.getImagemUrl()?.getValue() ?? null,
          disponivel: produto.getDisponibilidade().isDisponivel(),
          ordem: produto.getOrdem().getValue(),
        },
      });
    }
  }

  private dadosParaLinha(loja: Loja): Prisma.LojaUncheckedCreateInput {
    const tema = loja.getTema();
    return {
      id: loja.getId().toUUID(),
      lojistaId: loja.getLojistaId().toUUID(),
      nome: loja.getNome().getValue(),
      slug: loja.getSlug().getValue(),
      descricao: loja.getDescricao().isEmpty()
        ? null
        : loja.getDescricao().getValue(),
      whatsapp: loja.getWhatsapp().getE164(),
      status: loja.getStatus(),
      temaPaleta: tema.getPaleta(),
      temaEstilo: tema.getEstilo(),
      temaFormatoCard: tema.getFormatoCard(),
      temaLayout: tema.getLayout(),
      temaFonte: tema.getFonte(),
      temaLogoUrl: tema.getLogoUrl()?.getValue() ?? null,
      versao: loja.getVersion() ?? 1,
    };
  }

  private map(linha: LinhaLoja): Loja {
    return Loja.reconstruir({
      id: LojaId.fromString(linha.id),
      lojistaId: LojistaId.fromString(linha.lojistaId),
      nome: NomeLoja.of(linha.nome),
      slug: Slug.of(linha.slug),
      descricao: Descricao.of(linha.descricao ?? ""),
      whatsapp: Whatsapp.of(linha.whatsapp),
      status: linha.status,
      tema: IdentidadeVisual.of({
        paleta: linha.temaPaleta,
        estilo: linha.temaEstilo,
        formatoCard: linha.temaFormatoCard,
        layout: linha.temaLayout,
        fonte: parseFonte(linha.temaFonte) ?? Fonte.SANS,
        logoUrl: linha.temaLogoUrl !== null ? Url.of(linha.temaLogoUrl) : null,
      }),
      produtos: linha.produtos.map((p) =>
        Produto.of({
          id: ProdutoId.fromString(p.id),
          nome: NomeProduto.of(p.nome),
          descricao: Descricao.of(p.descricao ?? ""),
          preco: Preco.of(p.precoCents),
          categoriaId: p.categoriaId !== null ? CategoriaId.fromString(p.categoriaId) : null,
          imagemUrl: p.imagemUrl !== null ? Url.of(p.imagemUrl) : null,
          disponibilidade: DisponibilidadeValue.deBoolean(p.disponivel),
          ordem: Ordem.of(p.ordem),
        })
      ),
      categorias: linha.categorias.map((c) =>
        Categoria.of({
          id: CategoriaId.fromString(c.id),
          nome: NomeCategoria.of(c.nome),
          ordem: Ordem.of(c.ordem),
        })
      ),
      version: linha.versao,
    });
  }

  private mapearErroDePersistencia(erro: unknown): unknown {
    if (erro instanceof DadosDesatualizados) return erro;
    if (
      typeof erro === "object" &&
      erro !== null &&
      "code" in erro &&
      erro.code === "P2002"
    ) {
      const meta = (erro as { meta?: { target?: unknown } }).meta;
      const alvo = Array.isArray(meta?.target)
        ? (meta?.target as string[])
        : [];
      if (alvo.includes("slug")) return new SlugJaEmUso("slug");
      if (alvo.includes("lojistaId")) return new LojistaJaPossuiVitrine("lojista");
    }
    return erro;
  }
}
