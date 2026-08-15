import { LojistaId } from "@/kernel/ids/lojista-id";
import { Email } from "@/kernel/vos/email";
import { Telefone } from "@/kernel/vos/telefone";
import { LojistaNaoEncontrado } from "../domain/exceptions/lojista-nao-encontrado";
import { EmailJaCadastrado } from "../domain/exceptions/email-ja-cadastrado";
import type { LojistaRepository } from "../domain/lojista-repository";
import { Lojista } from "../domain/lojista";
import { NomeLojista } from "../domain/vos/nome-lojista";
import { AuthUserId } from "../domain/vos/auth-user-id";
import type { CadastrarLojista } from "./commands/cadastrar-lojista";
import type { VincularAutenticacao } from "./commands/vincular-autenticacao";

/**
 * Serviço de aplicação do lojista. Orquestra o agregado {@link Lojista} e sua
 * persistência, validando unicidade (e-mail) na fronteira do sistema.
 */
export class LojistaService {
  constructor(private readonly repository: LojistaRepository) {}

  async handle(cmd: CadastrarLojista): Promise<LojistaId> {
    const email = Email.of(cmd.email);

    if (await this.repository.existsByEmail(email)) {
      throw new EmailJaCadastrado(email.getValue());
    }

    const lojista = Lojista.cadastrar({
      id: LojistaId.random(),
      authUserId: cmd.authUserId !== undefined ? AuthUserId.of(cmd.authUserId) : null,
      nome: NomeLojista.of(cmd.nome),
      email,
      telefone: cmd.telefone !== null ? Telefone.of(cmd.telefone) : null,
    });

    const persistido = await this.repository.save(lojista);
    return persistido.getId();
  }

  async handleVincularAutenticacao(cmd: VincularAutenticacao): Promise<void> {
    const lojista = await this.buscarPorId(LojistaId.fromString(cmd.lojistaId));
    lojista.vincularAutenticacao(AuthUserId.of(cmd.authUserId));
    await this.repository.save(lojista);
  }

  private async buscarPorId(id: LojistaId): Promise<Lojista> {
    const lojista = await this.repository.findById(id);
    if (!lojista) throw new LojistaNaoEncontrado(id.toUUID());
    return lojista;
  }
}
