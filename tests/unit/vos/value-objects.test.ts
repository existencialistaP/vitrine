import { describe, it, expect } from "vitest";
import { Preco } from "@/modules/loja/domain/vos/preco";
import { PrecoInvalido } from "@/modules/loja/domain/exceptions/preco-invalido";
import { Slug } from "@/modules/loja/domain/vos/slug";
import { SlugInvalido } from "@/modules/loja/domain/exceptions/slug-invalido";
import { Whatsapp } from "@/modules/loja/domain/vos/whatsapp";
import { WhatsappInvalido } from "@/modules/loja/domain/exceptions/whatsapp-invalido";
import { Email } from "@/kernel/vos/email";
import { EmailInvalido } from "@/kernel/errors/email-invalido";
import { Telefone } from "@/kernel/vos/telefone";
import { TelefoneInvalido } from "@/kernel/errors/telefone-invalido";

describe("Preco", () => {
  it("cria preço a partir de centavos", () => {
    const preco = Preco.of(1234);
    expect(preco.getCents()).toBe(1234);
  });

  it("formata em reais", () => {
    expect(Preco.of(1234).formatarBRL()).toBe("R$ 12,34");
    expect(Preco.of(0).formatarBRL()).toBe("R$ 0,00");
  });

  it("rejeita valor negativo", () => {
    expect(() => Preco.of(-1)).toThrow(PrecoInvalido);
  });

  it("rejeita valor não inteiro", () => {
    expect(() => Preco.of(12.5)).toThrow(PrecoInvalido);
  });

  it("compara por valor", () => {
    expect(Preco.of(100).equals(Preco.of(100))).toBe(true);
    expect(Preco.of(100).equals(Preco.of(101))).toBe(false);
  });
});

describe("Slug", () => {
  it("normaliza texto com acentos e espaços", () => {
    expect(Slug.deTexto("Minha Loja Bonita").getValue()).toBe("minha-loja-bonita");
    expect(Slug.deTexto("Açaí & Cia").getValue()).toBe("acai-cia");
  });

  it("valida formato", () => {
    expect(Slug.of("minha-loja").getValue()).toBe("minha-loja");
    expect(() => Slug.of("Minha Loja")).toThrow(SlugInvalido);
    expect(() => Slug.of("ab")).toThrow(SlugInvalido);
    expect(() => Slug.of("slug com espaço")).toThrow(SlugInvalido);
  });
});

describe("Whatsapp", () => {
  it("normaliza para E.164 com código do Brasil", () => {
    const whatsapp = Whatsapp.of("(41) 99999-8888");
    expect(whatsapp.getE164()).toBe("5541999998888");
  });

  it("aceita número já com código do país", () => {
    expect(Whatsapp.of("5541999998888").getE164()).toBe("5541999998888");
  });

  it("gera link wa.me", () => {
    expect(Whatsapp.of("41999998888").getLink()).toBe("https://wa.me/5541999998888");
  });

  it("rejeita número sem DDD", () => {
    expect(() => Whatsapp.of("9999-8888")).toThrow(WhatsappInvalido);
  });
});

describe("Email", () => {
  it("normaliza para minúsculas", () => {
    expect(Email.of("  Lojista@Exemplo.COM ").getValue()).toBe("lojista@exemplo.com");
  });

  it("rejeita formato inválido", () => {
    expect(() => Email.of("nao-e-email")).toThrow(EmailInvalido);
    expect(() => Email.of("")).toThrow(EmailInvalido);
  });

  it("compara por valor", () => {
    expect(Email.of("a@b.com").equals(Email.of("A@B.COM"))).toBe(true);
  });
});

describe("Telefone", () => {
  it("normaliza dígitos", () => {
    expect(Telefone.of("(41) 98888-7777").getDigitos()).toBe("41988887777");
  });

  it("formata legível", () => {
    expect(Telefone.of("41988887777").formatar()).toBe("(41) 98888-7777");
  });

  it("rejeita quantidade inválida de dígitos", () => {
    expect(() => Telefone.of("123")).toThrow(TelefoneInvalido);
  });
});
