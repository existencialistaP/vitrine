import { describe, it, expect } from "vitest";
import { PedidoService } from "@/modules/pedido/application/pedido-service";
import { NomeLoja } from "@/modules/loja/domain/vos/nome-loja";
import { Whatsapp } from "@/modules/loja/domain/vos/whatsapp";
import { NomeProduto } from "@/modules/loja/domain/vos/nome-produto";
import { Preco } from "@/modules/loja/domain/vos/preco";
import { Quantidade } from "@/modules/pedido/domain/vos/quantidade";
import { ProdutoId } from "@/kernel/ids/produto-id";

describe("PedidoService (RF-005)", () => {
  const service = new PedidoService();

  it("formata pedido com itens e total", () => {
    const pedido = service.formatarPedido({
      lojaNome: NomeLoja.of("Café da Esquina"),
      whatsapp: Whatsapp.of("41999998888"),
      itens: [
        {
          produtoId: ProdutoId.random(),
          nome: NomeProduto.of("Café Arábica 250g"),
          preco: Preco.of(3500),
          quantidade: Quantidade.of(1),
        },
        {
          produtoId: ProdutoId.random(),
          nome: NomeProduto.of("Bolo de Chocolate"),
          preco: Preco.of(1200),
          quantidade: Quantidade.of(2),
        },
      ],
    });

    expect(pedido.texto).toContain("Café da Esquina");
    expect(pedido.texto).toContain("1x Café Arábica 250g — R$ 35,00");
    expect(pedido.texto).toContain("2x Bolo de Chocolate — R$ 24,00");
    expect(pedido.total.getCents()).toBe(5900);
  });

  it("gera link wa.me com texto pré-preenchido", () => {
    const pedido = service.formatarPedido({
      lojaNome: NomeLoja.of("Café da Esquina"),
      whatsapp: Whatsapp.of("41999998888"),
      itens: [
        {
          produtoId: ProdutoId.random(),
          nome: NomeProduto.of("Café Arábica 250g"),
          preco: Preco.of(3500),
          quantidade: Quantidade.of(1),
        },
      ],
    });

    expect(pedido.linkWhatsapp.startsWith("https://wa.me/5541999998888?text=")).toBe(true);
    expect(decodeURIComponent(pedido.linkWhatsapp)).toContain("Café Arábica 250g");
  });

  it("inclui observações quando informadas", () => {
    const pedido = service.formatarPedido({
      lojaNome: NomeLoja.of("Café da Esquina"),
      whatsapp: Whatsapp.of("41999998888"),
      itens: [
        {
          produtoId: ProdutoId.random(),
          nome: NomeProduto.of("Café Arábica 250g"),
          preco: Preco.of(3500),
          quantidade: Quantidade.of(1),
        },
      ],
      observacao: "Entregar após 18h",
    });

    expect(pedido.texto).toContain("Entregar após 18h");
  });
});
