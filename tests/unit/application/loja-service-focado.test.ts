import { beforeEach, describe, expect, it } from "vitest";

import { LojaService } from "@/modules/loja/application/loja-service";
import { CriarLoja } from "@/modules/loja/application/commands/criar-loja";
import { AdicionarProduto } from "@/modules/loja/application/commands/adicionar-produto";
import { AlterarTema } from "@/modules/loja/application/commands/alterar-tema";
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia";
import { DadosDesatualizados } from "@/modules/loja/domain/exceptions/dados-desatualizados";
import { InMemoryLojaRepository } from "@tests/helpers/in-memory-loja-repository";
import { FakeEventBus } from "@tests/helpers/fake-event-bus";
import { LojistaId } from "@/kernel/ids/lojista-id";

const PAGINAS = [
  {
    id: "home-1",
    rotulo: "Home",
    ordem: 0,
    blocos: [
      {
        id: "hero-1",
        type: "hero" as const,
        label: "Hero",
        visible: true,
        props: { title: "Cafés especiais" },
      },
    ],
  },
];

describe("LojaService — gravação focada", () => {
  let repository: InMemoryLojaRepository;
  let eventBus: FakeEventBus;
  let service: LojaService;

  beforeEach(() => {
    repository = new InMemoryLojaRepository();
    eventBus = new FakeEventBus();
    service = new LojaService(repository, eventBus);
  });

  async function criarComProduto() {
    const lojaId = await service.handle(
      CriarLoja.from({ lojistaId: LojistaId.random().toUUID(), nome: "Café", whatsapp: "41999998888" })
    );
    await service.handle(
      AdicionarProduto.from({ lojaId: lojaId.toUUID(), nome: "Bolo", precoCents: 1500 })
    );
    return lojaId;
  }

  it("salvar experiência preserva produtos/categorias intactos", async () => {
    const lojaId = await criarComProduto();

    await service.handle(SalvarExperiencia.from({ lojaId: lojaId.toUUID(), paginas: PAGINAS }));

    const loja = await repository.findById(lojaId);
    expect(loja?.getExperiencia().getPaginas()).toHaveLength(1);
    expect(loja?.getProdutos()).toHaveLength(1);
    expect(loja?.getProdutos()[0].getNome().getValue()).toBe("Bolo");
  });

  it("salvar tema preserva produtos intactos", async () => {
    const lojaId = await criarComProduto();

    await service.handle(
      AlterarTema.from({
        lojaId: lojaId.toUUID(),
        paleta: "BLUSH",
        estilo: "MODERNO",
        formatoCard: "RETRATO",
        layout: "LISTA",
        fonte: "SANS",
      })
    );

    const loja = await repository.findById(lojaId);
    expect(loja?.getTema().getPaleta()).toBe("BLUSH");
    expect(loja?.getProdutos()).toHaveLength(1);
  });

  it("propaga conflito de versão como DadosDesatualizados", async () => {
    const lojaId = await criarComProduto();

    class RepoConflito extends InMemoryLojaRepository {
      override async atualizarExperiencia(): Promise<void> {
        throw new DadosDesatualizados("loja");
      }
    }
    const serviceConflito = new LojaService(new RepoConflito(repository), eventBus);

    await expect(
      serviceConflito.handle(SalvarExperiencia.from({ lojaId: lojaId.toUUID(), paginas: PAGINAS }))
    ).rejects.toBeInstanceOf(DadosDesatualizados);
  });
});
