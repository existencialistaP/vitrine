import { LojaId } from "@/kernel/ids/loja-id";
import { CategoriaId } from "@/kernel/ids/categoria-id";
import { ProdutoId } from "@/kernel/ids/produto-id";
import { LojistaId } from "@/kernel/ids/lojista-id";
import type { EventBus } from "@/kernel/events/event-bus";
import { LojaNaoEncontrada } from "../domain/exceptions/loja-nao-encontrada";
import { SlugJaEmUso } from "../domain/exceptions/slug-ja-em-uso";
import { LojistaJaPossuiVitrine } from "../domain/exceptions/lojista-ja-possui-vitrine";
import type { LojaRepository } from "../domain/loja-repository";
import { Loja } from "../domain/loja";
import { Produto } from "../domain/produto";
import { NomeLoja } from "../domain/vos/nome-loja";
import { NomeProduto } from "../domain/vos/nome-produto";
import { Descricao } from "../domain/vos/descricao";
import { Slug } from "../domain/vos/slug";
import { Whatsapp } from "../domain/vos/whatsapp";
import { Preco } from "../domain/vos/preco";
import { Url } from "../domain/vos/url";
import { IdentidadeVisual } from "../domain/vos/identidade-visual";
import { CorHex } from "../domain/vos/cor-hex";
import { parseFonte } from "../domain/vos/fonte";
import { DisponibilidadeValue } from "../domain/vos/disponibilidade";
import { CriarLoja } from "./commands/criar-loja";
import { AdicionarProduto } from "./commands/adicionar-produto";
import { AtualizarProduto } from "./commands/atualizar-produto";
import { RemoverProduto } from "./commands/remover-produto";
import { AlterarDisponibilidade } from "./commands/alterar-disponibilidade";
import { AlterarTema } from "./commands/alterar-tema";

/**
 * Serviço de aplicação da vitrine. Orquestra o agregado {@link Loja}, aplica as
 * regras de unicidade na fronteira (slug, vínculo de exclusividade) e publica
 * os eventos de domínio após a persistência.
 */
export class LojaService {
  constructor(
    private readonly repository: LojaRepository,
    private readonly eventBus: EventBus
  ) {}

  async handle(cmd: CriarLoja): Promise<LojaId>;
  async handle(cmd: AdicionarProduto): Promise<ProdutoId>;
  async handle(cmd: AtualizarProduto): Promise<void>;
  async handle(cmd: RemoverProduto): Promise<void>;
  async handle(cmd: AlterarDisponibilidade): Promise<void>;
  async handle(cmd: AlterarTema): Promise<void>;
  async handle(
    cmd:
      | CriarLoja
      | AdicionarProduto
      | AtualizarProduto
      | RemoverProduto
      | AlterarDisponibilidade
      | AlterarTema
  ): Promise<LojaId | ProdutoId | void> {
    if (cmd instanceof CriarLoja) return this.criarLoja(cmd);
    if (cmd instanceof AdicionarProduto) return this.adicionarProduto(cmd);
    if (cmd instanceof AtualizarProduto) return this.atualizarProduto(cmd);
    if (cmd instanceof RemoverProduto) return this.removerProduto(cmd);
    if (cmd instanceof AlterarDisponibilidade) return this.alterarDisponibilidade(cmd);
    return this.alterarTema(cmd);
  }

  private async criarLoja(cmd: CriarLoja): Promise<LojaId> {
    const lojistaId = LojistaId.fromString(cmd.lojistaId);

    const lojaExistente = await this.repository.findByLojistaId(lojistaId);
    if (lojaExistente) {
      throw new LojistaJaPossuiVitrine(lojistaId.toUUID());
    }

    const slug = cmd.slug !== undefined ? Slug.of(cmd.slug) : Slug.deTexto(cmd.nome);
    if (await this.repository.existsBySlug(slug)) {
      throw new SlugJaEmUso(slug.getValue());
    }

    const loja = Loja.criar({
      id: LojaId.random(),
      lojistaId,
      nome: NomeLoja.of(cmd.nome),
      slug,
      descricao: Descricao.of(cmd.descricao),
      whatsapp: Whatsapp.of(cmd.whatsapp),
    });

    return this.persistir(loja);
  }

  private async adicionarProduto(cmd: AdicionarProduto): Promise<ProdutoId> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));

    const produto = Produto.of({
      id: ProdutoId.random(),
      nome: NomeProduto.of(cmd.nome),
      descricao: Descricao.of(cmd.descricao),
      preco: Preco.of(cmd.precoCents),
      categoriaId: cmd.categoriaId !== null ? CategoriaId.fromString(cmd.categoriaId) : null,
      imagemUrl: cmd.imagemUrl !== null ? Url.of(cmd.imagemUrl) : null,
      disponibilidade: DisponibilidadeValue.deBoolean(cmd.disponivel),
    });

    loja.adicionarProduto(produto);
    await this.persistir(loja);
    return produto.getId();
  }

  private async atualizarProduto(cmd: AtualizarProduto): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));

    loja.atualizarProduto(ProdutoId.fromString(cmd.produtoId), {
      nome: cmd.nome !== undefined ? NomeProduto.of(cmd.nome) : undefined,
      descricao: cmd.descricao !== undefined ? Descricao.of(cmd.descricao) : undefined,
      preco: cmd.precoCents !== undefined ? Preco.of(cmd.precoCents) : undefined,
      categoriaId:
        cmd.categoriaId !== undefined
          ? cmd.categoriaId !== null
            ? CategoriaId.fromString(cmd.categoriaId)
            : null
          : undefined,
      imagemUrl:
        cmd.imagemUrl !== undefined
          ? cmd.imagemUrl !== null
            ? Url.of(cmd.imagemUrl)
            : null
          : undefined,
    });

    await this.persistir(loja);
  }

  private async removerProduto(cmd: RemoverProduto): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));
    loja.removerProduto(ProdutoId.fromString(cmd.produtoId));
    await this.persistir(loja);
  }

  private async alterarDisponibilidade(cmd: AlterarDisponibilidade): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));
    loja.alterarDisponibilidade(
      ProdutoId.fromString(cmd.produtoId),
      DisponibilidadeValue.deBoolean(cmd.disponivel)
    );
    await this.persistir(loja);
  }

  private async alterarTema(cmd: AlterarTema): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));

    const tema = IdentidadeVisual.of({
      corPrimaria: CorHex.of(cmd.corPrimaria),
      corSecundaria: CorHex.of(cmd.corSecundaria),
      corFundo: CorHex.of(cmd.corFundo),
      fonte: parseFonte(cmd.fonte),
      logoUrl: cmd.logoUrl !== null ? Url.of(cmd.logoUrl) : null,
    });

    loja.alterarTema(tema);
    await this.persistir(loja);
  }

  async buscarPorSlug(slug: string): Promise<Loja> {
    const loja = await this.repository.findBySlug(Slug.of(slug));
    if (!loja) throw new LojaNaoEncontrada(`slug "${slug}"`);
    return loja;
  }

  private async buscarPorId(id: LojaId): Promise<Loja> {
    const loja = await this.repository.findById(id);
    if (!loja) throw new LojaNaoEncontrada(id.toUUID());
    return loja;
  }

  private async persistir(loja: Loja): Promise<LojaId> {
    const persistido = await this.repository.save(loja);
    await this.eventBus.publish(persistido.pullDomainEvents());
    return persistido.getId();
  }
}
