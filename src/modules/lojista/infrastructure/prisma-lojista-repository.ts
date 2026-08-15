import type { PrismaClient } from "@/generated/prisma/client";
import { LojistaId } from "@/kernel/ids/lojista-id";
import { Email } from "@/kernel/vos/email";
import { Telefone } from "@/kernel/vos/telefone";
import type { LojistaRepository } from "@/modules/lojista/domain/lojista-repository";
import { Lojista } from "@/modules/lojista/domain/lojista";
import { NomeLojista } from "@/modules/lojista/domain/vos/nome-lojista";
import { AuthUserId } from "@/modules/lojista/domain/vos/auth-user-id";

/**
 * Implementação Prisma do {@link LojistaRepository}. Mapeia o agregado para a
 * tabela {@code usuarios}; o vínculo de exclusividade com a vitrine é garantido
 * pela constraint {@code lojas.lojistaId UNIQUE}.
 */
export class PrismaLojistaRepository implements LojistaRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(lojista: Lojista): Promise<Lojista> {
    const authUserId = lojista.getAuthUserId()?.getValue() ?? null;
    const telefone = lojista.getTelefone()?.getDigitos() ?? null;

    const linha = await this.prisma.usuario.upsert({
      where: { id: lojista.getId().toUUID() },
      create: {
        id: lojista.getId().toUUID(),
        authUserId,
        nome: lojista.getNome().getValue(),
        email: lojista.getEmail().getValue(),
        telefone,
      },
      update: {
        authUserId,
        nome: lojista.getNome().getValue(),
        telefone,
      },
    });

    return this.map(linha);
  }

  async findById(id: LojistaId): Promise<Lojista | null> {
    const linha = await this.prisma.usuario.findUnique({
      where: { id: id.toUUID() },
    });
    return linha ? this.map(linha) : null;
  }

  async findByAuthUserId(authUserId: AuthUserId): Promise<Lojista | null> {
    const linha = await this.prisma.usuario.findUnique({
      where: { authUserId: authUserId.getValue() },
    });
    return linha ? this.map(linha) : null;
  }

  async findByEmail(email: Email): Promise<Lojista | null> {
    const linha = await this.prisma.usuario.findUnique({
      where: { email: email.getValue() },
    });
    return linha ? this.map(linha) : null;
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const linha = await this.prisma.usuario.findUnique({
      where: { email: email.getValue() },
      select: { id: true },
    });
    return linha !== null;
  }

  private map(linha: {
    id: string;
    authUserId: string | null;
    nome: string;
    email: string;
    telefone: string | null;
  }): Lojista {
    return Lojista.reconstruir({
      id: LojistaId.fromString(linha.id),
      authUserId:
        linha.authUserId !== null ? AuthUserId.of(linha.authUserId) : null,
      nome: NomeLojista.of(linha.nome),
      email: Email.of(linha.email),
      telefone: linha.telefone !== null ? Telefone.of(linha.telefone) : null,
      version: null,
    });
  }
}
