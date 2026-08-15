import { config } from "dotenv";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env.local" });

/**
 * Seed da vitrine de demonstração ("Ver exemplo").
 *
 * Cria o lojista demo, a vitrine "Doce & Tal", categorias e produtos. É
 * idempotente (upserts por ids fixos). Executar com: `npm run db:seed`.
 */
async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL ?? "",
  });
  const prisma = new PrismaClient({ adapter });

  const usuarioId = "00000000-0000-0000-0000-000000000001";
  const lojaId = "00000000-0000-0000-0000-000000000002";
  const categoriaDocesId = "00000000-0000-0000-0000-000000000011";
  const categoriaBolosId = "00000000-0000-0000-0000-000000000012";

  await prisma.usuario.upsert({
    where: { id: usuarioId },
    create: {
      id: usuarioId,
      authUserId: "demo-vitrine",
      nome: "Confeitaria Doce & Tal",
      email: "demo@vitrine.app",
      telefone: "41999998888",
    },
    update: {
      nome: "Confeitaria Doce & Tal",
      email: "demo@vitrine.app",
      telefone: "41999998888",
    },
  });

  const dadosLoja = {
    lojistaId: usuarioId,
    nome: "Doce & Tal",
    slug: "doce-e-tal",
    descricao:
      "Doces artesanais para alegrar o seu dia. Encomende pelo WhatsApp!",
    whatsapp: "5541999998888",
    status: "ATIVA" as const,
    temaCorPrimaria: "#E11D48",
    temaCorSecundaria: "#F59E0B",
    temaCorFundo: "#FFF7ED",
    temaFonte: "SANS",
    temaLogoUrl: null,
  };

  await prisma.loja.upsert({
    where: { id: lojaId },
    create: { id: lojaId, ...dadosLoja },
    update: dadosLoja,
  });

  await prisma.categoria.upsert({
    where: { id: categoriaDocesId },
    create: {
      id: categoriaDocesId,
      lojaId,
      nome: "Doces",
      ordem: 0,
    },
    update: { lojaId, nome: "Doces", ordem: 0 },
  });

  await prisma.categoria.upsert({
    where: { id: categoriaBolosId },
    create: {
      id: categoriaBolosId,
      lojaId,
      nome: "Bolos",
      ordem: 1,
    },
    update: { lojaId, nome: "Bolos", ordem: 1 },
  });

  const produtos = [
    {
      id: "00000000-0000-0000-0000-000000000021",
      nome: "Brigadeiro Gourmet",
      descricao: "Chocolate 50% cacau com granulado belga. Unidade.",
      precoCents: 450,
      categoriaId: categoriaDocesId,
      imagemUrl:
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "00000000-0000-0000-0000-000000000022",
      nome: "Beijinho",
      descricao: "Coco fresco com cravo. Unidade.",
      precoCents: 400,
      categoriaId: categoriaDocesId,
      imagemUrl: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000023",
      nome: "Cupcake de Baunilha",
      descricao: "Massa leve com cobertura de cream cheese.",
      precoCents: 650,
      categoriaId: categoriaDocesId,
      imagemUrl:
        "https://images.unsplash.com/photo-1607478900766-efe13248b125?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "00000000-0000-0000-0000-000000000024",
      nome: "Caixa de Bombom Artesanal",
      descricao: "12 unidades sortidas em caixa para presente.",
      precoCents: 2500,
      categoriaId: categoriaDocesId,
      imagemUrl: null,
    },
    {
      id: "00000000-0000-0000-0000-000000000025",
      nome: "Fatia de Bolo de Chocolate",
      descricao: "Massa úmida com recheio de brigadeiro.",
      precoCents: 990,
      categoriaId: categoriaBolosId,
      imagemUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "00000000-0000-0000-0000-000000000026",
      nome: "Bolo no Pote",
      descricao: "Camadas de bolo e creme. Pote de 250g.",
      precoCents: 1200,
      categoriaId: categoriaBolosId,
      imagemUrl:
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80",
    },
  ];

  for (const [indice, produto] of produtos.entries()) {
    await prisma.produto.upsert({
      where: { id: produto.id },
      create: {
        id: produto.id,
        lojaId,
        nome: produto.nome,
        descricao: produto.descricao,
        precoCents: produto.precoCents,
        categoriaId: produto.categoriaId,
        imagemUrl: produto.imagemUrl,
        disponivel: true,
        ordem: indice,
      },
      update: {
        lojaId,
        nome: produto.nome,
        descricao: produto.descricao,
        precoCents: produto.precoCents,
        categoriaId: produto.categoriaId,
        imagemUrl: produto.imagemUrl,
        disponivel: true,
        ordem: indice,
      },
    });
  }

  console.log("Demo 'Doce & Tal' pronta em https://vitrine.app/doce-e-tal");
  await prisma.$disconnect();
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
