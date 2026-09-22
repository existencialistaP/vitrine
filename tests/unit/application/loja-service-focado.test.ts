import { beforeEach, describe, expect, it } from "vitest";

import { LojaService } from "@/modules/loja/application/loja-service";
import { CriarLoja } from "@/modules/loja/application/commands/criar-loja";
import { AdicionarProduto } from "@/modules/loja/application/commands/adicionar-produto";
import { AlterarTema } from "@/modules/loja/application/commands/alterar-tema";
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia";
import { DadosDesatualizados } from "@/modules/loja/domain/exceptions/dados-desatualizados";
import type { Loja } from "@/modules/loja/domain/loja";
import { InMemoryLojaRepository } from "@tests/helpers/in-memory-loja-repository";
import { FakeEventBus } from "@tests/helpers/fake-event-bus";
import { LojistaId } from "@/kernel/ids/lojista-id";

const TEMA = {
  paleta: "BLUSH",
  estilo: "MODERNO",
  formatoCard: "RETRATO",
  layout: "LISTA",
  fonte: "SANS",
} as const;

/** Conta as chamadas de escrita para distinguir gravação focada de save completo. */
class RepoGravador extends InMemoryLojaRepository {
  readonly chamadas = { save: 0, atualizarExperiencia: 0, atualizarTema: 0 };

  override async save(loja: Loja): Promise<Loja> {
    this.chamadas.save += 1;
    return super.save(loja);
  }

  override async atualizarExperiencia(loja: Loja): Promise<void> {
    this.chamadas.atualizarExperiencia += 1;
    return super.atualizarExperiencia(loja);
  }

  override async atualizarTema(loja: Loja): Promise<void> {
    this.chamadas.atualizarTema += 1;
    return super.atualizarTema(loja);
  }
}

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

  it("salvar experiência usa gravação focada e não chama save", async () => {
    const gravador = new RepoGravador();
    const servicoGravador = new LojaService(gravador, eventBus);
    const lojaId = await servicoGravador.handle(
      CriarLoja.from({ lojistaId: LojistaId.random().toUUID(), nome: "Café", whatsapp: "41999998888" })
    );
    await servicoGravador.handle(
      AdicionarProduto.from({ lojaId: lojaId.toUUID(), nome: "Bolo", precoCents: 1500 })
    );

    gravador.chamadas.save = 0;

    await servicoGravador.handle(
      SalvarExperiencia.from({ lojaId: lojaId.toUUID(), paginas: PAGINAS })
    );

    expect(gravador.chamadas.atualizarExperiencia).toBe(1);
    expect(gravador.chamadas.atualizarTema).toBe(0);
    expect(gravador.chamadas.save).toBe(0);
    const loja = await gravador.findById(lojaId);
    expect(loja?.getExperiencia().getPaginas()).toHaveLength(1);
    expect(loja?.getProdutos()).toHaveLength(1);
  });

  it("salvar tema usa gravação focada e não chama save", async () => {
    const gravador = new RepoGravador();
    const servicoGravador = new LojaService(gravador, eventBus);
    const lojaId = await servicoGravador.handle(
      CriarLoja.from({ lojistaId: LojistaId.random().toUUID(), nome: "Café", whatsapp: "41999998888" })
    );
    await servicoGravador.handle(
      AdicionarProduto.from({ lojaId: lojaId.toUUID(), nome: "Bolo", precoCents: 1500 })
    );

    gravador.chamadas.save = 0;

    await servicoGravador.handle(AlterarTema.from({ lojaId: lojaId.toUUID(), ...TEMA }));

    expect(gravador.chamadas.atualizarTema).toBe(1);
    expect(gravador.chamadas.atualizarExperiencia).toBe(0);
    expect(gravador.chamadas.save).toBe(0);
    const loja = await gravador.findById(lojaId);
    expect(loja?.getTema().getPaleta()).toBe("BLUSH");
    expect(loja?.getProdutos()).toHaveLength(1);
  });

  it("duas gravações focadas consecutivas não disparam conflito espúrio", async () => {
    const lojaId = await criarComProduto();

    await service.handle(SalvarExperiencia.from({ lojaId: lojaId.toUUID(), paginas: PAGINAS }));
    await service.handle(AlterarTema.from({ lojaId: lojaId.toUUID(), ...TEMA }));

    const loja = await repository.findById(lojaId);
    expect(loja?.getExperiencia().getPaginas()).toHaveLength(1);
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
