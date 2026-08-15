import type { PrismaClient } from "@/generated/prisma/client";
import { LojistaService } from "@/modules/lojista/application/lojista-service";
import { PrismaLojistaRepository } from "@/modules/lojista/infrastructure/prisma-lojista-repository";
import { LojaService } from "@/modules/loja/application/loja-service";
import { PrismaLojaRepository } from "@/modules/loja/infrastructure/prisma-loja-repository";
import { CatalogoService } from "@/modules/catalogo/application/catalogo-service";
import { PrismaCatalogoRepository } from "@/modules/catalogo/infrastructure/prisma-catalogo-repository";
import { PedidoService } from "@/modules/pedido/application/pedido-service";
import { InMemoryEventBus } from "@/infrastructure/events/in-memory-event-bus";
import { prisma as prismaClient } from "@/infrastructure/db/prisma";

/**
 * Raiz de composição (composition root): registra as dependências concretas dos
 * serviços de aplicação. Em testes, os services podem ser instanciados com
 * fakes em memória implementando as mesmas interfaces de repositório.
 */
export class Container {
  readonly eventBus: InMemoryEventBus;
  readonly lojistaService: LojistaService;
  readonly lojaService: LojaService;
  readonly catalogoService: CatalogoService;
  readonly pedidoService: PedidoService;

  constructor(prisma: PrismaClient = prismaClient) {
    this.eventBus = new InMemoryEventBus();

    const lojistaRepository = new PrismaLojistaRepository(prisma);
    const lojaRepository = new PrismaLojaRepository(prisma);
    const catalogoRepository = new PrismaCatalogoRepository(prisma);

    this.lojistaService = new LojistaService(lojistaRepository);
    this.lojaService = new LojaService(lojaRepository, this.eventBus);
    this.catalogoService = new CatalogoService(catalogoRepository);
    this.pedidoService = new PedidoService();
  }
}
