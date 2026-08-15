import type { LojistaId } from "@/kernel/ids/lojista-id";
import { AggregateRoot } from "@/kernel/ddd/aggregate-root";
import type { Email } from "@/kernel/vos/email";
import type { Telefone } from "@/kernel/vos/telefone";
import { LojistaCadastrado } from "./events/lojista-cadastrado";
import type { AuthUserId } from "./vos/auth-user-id";
import type { NomeLojista } from "./vos/nome-lojista";

/**
 * Raiz do agregado do lojista: a identidade comercial do usuário da plataforma.
 *
 * Guarda o vínculo com a autenticação externa (Supabase Auth) e os dados de
 * perfil. O vínculo de exclusividade com a vitrine é garantido pelo agregado
 * {@code Loja}.
 */
export class Lojista extends AggregateRoot<LojistaId> {
  private authUserId: AuthUserId | null;
  private nome: NomeLojista;
  private email: Email;
  private telefone: Telefone | null;

  private constructor(params: {
    id: LojistaId;
    authUserId: AuthUserId | null;
    nome: NomeLojista;
    email: Email;
    telefone: Telefone | null;
    version?: number | null;
  }) {
    super(params.id, params.version ?? null);
    this.authUserId = params.authUserId;
    this.nome = params.nome;
    this.email = params.email;
    this.telefone = params.telefone;
  }

  /** Cadastra um novo lojista. */
  static cadastrar(params: {
    id: LojistaId;
    authUserId: AuthUserId | null;
    nome: NomeLojista;
    email: Email;
    telefone?: Telefone | null;
  }): Lojista {
    const lojista = new Lojista({ ...params, telefone: params.telefone ?? null });
    lojista.registerEvent(LojistaCadastrado.from(lojista));
    return lojista;
  }

  /** Reconstrói um lojista persistido (apenas para a infraestrutura). */
  static reconstruir(params: {
    id: LojistaId;
    authUserId: AuthUserId | null;
    nome: NomeLojista;
    email: Email;
    telefone: Telefone | null;
    version: number | null;
  }): Lojista {
    return new Lojista(params);
  }

  getAuthUserId(): AuthUserId | null {
    return this.authUserId;
  }

  getNome(): NomeLojista {
    return this.nome;
  }

  getEmail(): Email {
    return this.email;
  }

  getTelefone(): Telefone | null {
    return this.telefone;
  }

  /** Vincula a identidade do Supabase Auth ao perfil do lojista. */
  vincularAutenticacao(authUserId: AuthUserId): void {
    this.authUserId = authUserId;
  }

  alterarPerfil(params: { nome?: NomeLojista; telefone?: Telefone | null }): void {
    if (params.nome !== undefined) this.nome = params.nome;
    if (params.telefone !== undefined) this.telefone = params.telefone;
  }
}
