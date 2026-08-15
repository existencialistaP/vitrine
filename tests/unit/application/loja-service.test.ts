import { describe, it, expect, beforeEach } from "vitest";
import { LojaService } from "@/modules/loja/application/loja-service";
import { CriarLoja } from "@/modules/loja/application/commands/criar-loja";
import { AdicionarProduto } from "@/modules/loja/application/commands/adicionar-produto";
import { AtualizarProduto } from "@/modules/loja/application/commands/atualizar-produto";
import { RemoverProduto } from "@/modules/loja/application/commands/remover-produto";
import { AlterarTema } from "@/modules/loja/application/commands/alterar-tema";
import { SlugJaEmUso } from "@/modules/loja/domain/exceptions/slug-ja-em-uso";
import { LojistaJaPossuiVitrine } from "@/modules/loja/domain/exceptions/lojista-ja-possui-vitrine";
import { ProdutoNaoEncontrado } from "@/modules/loja/domain/exceptions/produto-nao-encontrado";
import { LojaCriada } from "@/modules/loja/domain/events/loja-criada";
import { ProdutoAdicionado } from "@/modules/loja/domain/events/produto-adicionado";
import { InMemoryLojaRepository } from "@tests/helpers/in-memory-loja-repository";
import { FakeEventBus } from "@tests/helpers/fake-event-bus";
import { LojistaId } from "@/kernel/ids/lojista-id";

describe("LojaService (aplicação)", () => {
  let repository: InMemoryLojaRepository;
  let eventBus: FakeEventBus;
  let service: LojaService;

  const lojistaId = () => LojistaId.random().toUUID();

  beforeEach(() => {
    repository = new InMemoryLojaRepository();
    eventBus = new FakeEventBus();
    service = new LojaService(repository, eventBus);
  });

  it("cria vitrine a partir de comando e publica LojaCriada", async () => {
    const id = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        descricao: "Cafés especiais",
        whatsapp: "41999998888",
      })
    );

    expect(repository.size).toBe(1);
    expect(id.toUUID()).toBeTruthy();
    expect(eventBus.publicados[0]).toBeInstanceOf(LojaCriada);
  });

  it("deriva o slug do nome quando não informado", async () => {
    const id = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );

    const loja = await repository.findById(id);
    expect(loja?.getSlug().getValue()).toBe("cafe-da-esquina");
  });

  it("rejeita slug já em uso", async () => {
    await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );

    await expect(
      service.handle(
        CriarLoja.from({
          lojistaId: lojistaId(),
          nome: "Outro Café",
          slug: "cafe-da-esquina",
          whatsapp: "41999998888",
        })
      )
    ).rejects.toBeInstanceOf(SlugJaEmUso);
  });

  it("rejeita segundo vitrine do mesmo lojista (exclusividade)", async () => {
    const dono = lojistaId();
    await service.handle(
      CriarLoja.from({ lojistaId: dono, nome: "Loja Um", whatsapp: "41999998888" })
    );

    await expect(
      service.handle(
        CriarLoja.from({ lojistaId: dono, nome: "Loja Dois", whatsapp: "41999998888" })
      )
    ).rejects.toBeInstanceOf(LojistaJaPossuiVitrine);
  });

  it("adiciona produto e publica ProdutoAdicionado", async () => {
    const lojaId = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );

    const produtoId = await service.handle(
      AdicionarProduto.from({
        lojaId: lojaId.toUUID(),
        nome: "Café Arábica 250g",
        precoCents: 3500,
      })
    );

    expect(produtoId.toUUID()).toBeTruthy();
    expect(eventBus.publicados.at(-1)).toBeInstanceOf(ProdutoAdicionado);
  });

  it("atualiza preço do produto", async () => {
    const lojaId = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );
    const produtoId = await service.handle(
      AdicionarProduto.from({
        lojaId: lojaId.toUUID(),
        nome: "Café Arábica 250g",
        precoCents: 3500,
      })
    );

    await service.handle(
      AtualizarProduto.from({
        lojaId: lojaId.toUUID(),
        produtoId: produtoId.toUUID(),
        precoCents: 4000,
      })
    );

    const loja = await repository.findById(lojaId);
    expect(loja?.getProdutos()[0].getPreco().getCents()).toBe(4000);
  });

  it("rejeita atualizar produto inexistente", async () => {
    const lojaId = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );

    await expect(
      service.handle(
        AtualizarProduto.from({
          lojaId: lojaId.toUUID(),
          produtoId: "00000000-0000-4000-8000-000000000000",
          precoCents: 4000,
        })
      )
    ).rejects.toBeInstanceOf(ProdutoNaoEncontrado);
  });

  it("remove produto", async () => {
    const lojaId = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );
    const produtoId = await service.handle(
      AdicionarProduto.from({
        lojaId: lojaId.toUUID(),
        nome: "Café Arábica 250g",
        precoCents: 3500,
      })
    );

    await service.handle(
      RemoverProduto.from({
        lojaId: lojaId.toUUID(),
        produtoId: produtoId.toUUID(),
      })
    );

    const loja = await repository.findById(lojaId);
    expect(loja?.getProdutos()).toHaveLength(0);
  });

  it("altera o tema da vitrine", async () => {
    const lojaId = await service.handle(
      CriarLoja.from({
        lojistaId: lojistaId(),
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    );

    await service.handle(
      AlterarTema.from({
        lojaId: lojaId.toUUID(),
        corPrimaria: "#000000",
        corSecundaria: "#00FF00",
        corFundo: "#FFFFFF",
        fonte: "SANS",
      })
    );

    const loja = await repository.findById(lojaId);
    expect(loja?.getTema().getCorPrimaria().getValue()).toBe("#000000");
  });

  it("valida comando inválido na fronteira", () => {
    expect(() =>
      CriarLoja.from({
        lojistaId: "uuid-invalido",
        nome: "Café da Esquina",
        whatsapp: "41999998888",
      })
    ).toThrow();
  });
});
