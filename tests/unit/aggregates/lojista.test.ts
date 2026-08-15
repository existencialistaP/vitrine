import { describe, it, expect } from "vitest";
import { Lojista } from "@/modules/lojista/domain/lojista";
import { LojistaCadastrado } from "@/modules/lojista/domain/events/lojista-cadastrado";
import { NomeLojista } from "@/modules/lojista/domain/vos/nome-lojista";
import { AuthUserId } from "@/modules/lojista/domain/vos/auth-user-id";
import { Email } from "@/kernel/vos/email";
import { Telefone } from "@/kernel/vos/telefone";
import { LojistaId } from "@/kernel/ids/lojista-id";

describe("Lojista (agregado)", () => {
  it("cadastra e registra LojistaCadastrado", () => {
    const lojista = Lojista.cadastrar({
      id: LojistaId.random(),
      authUserId: null,
      nome: NomeLojista.of("Maria Silva"),
      email: Email.of("maria@exemplo.com"),
      telefone: Telefone.of("41988887777"),
    });

    expect(lojista.getEmail().getValue()).toBe("maria@exemplo.com");
    expect(lojista.getAuthUserId()).toBeNull();

    const eventos = lojista.pullDomainEvents();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]).toBeInstanceOf(LojistaCadastrado);
  });

  it("vincula autenticação externa", () => {
    const lojista = Lojista.cadastrar({
      id: LojistaId.random(),
      authUserId: null,
      nome: NomeLojista.of("João"),
      email: Email.of("joao@exemplo.com"),
    });

    lojista.vincularAutenticacao(AuthUserId.of("auth-123"));

    expect(lojista.getAuthUserId()?.getValue()).toBe("auth-123");
  });
});
