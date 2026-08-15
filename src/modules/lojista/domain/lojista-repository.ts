import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { Lojista } from "./lojista";
import type { AuthUserId } from "./vos/auth-user-id";
import type { Email } from "@/kernel/vos/email";

/**
 * Contrato de persistência do agregado {@link Lojista}. Implementado na camada
 * de infraestrutura (Prisma); domínio e aplicação dependem apenas desta
 * interface.
 */
export interface LojistaRepository {
  save(lojista: Lojista): Promise<Lojista>;

  findById(id: LojistaId): Promise<Lojista | null>;

  findByAuthUserId(authUserId: AuthUserId): Promise<Lojista | null>;

  findByEmail(email: Email): Promise<Lojista | null>;

  existsByEmail(email: Email): Promise<boolean>;
}
