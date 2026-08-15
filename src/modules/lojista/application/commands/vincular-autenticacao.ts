import { z } from "zod";

const VincularAutenticacaoSchema = z.object({
  lojistaId: z.string().uuid("lojistaId deve ser um UUID"),
  authUserId: z.string().trim().min(1, "authUserId é obrigatório"),
});

/** Comando para vincular o perfil do lojista ao Supabase Auth. */
export class VincularAutenticacao {
  private constructor(
    readonly lojistaId: string,
    readonly authUserId: string
  ) {}

  static from(input: unknown): VincularAutenticacao {
    const dados = VincularAutenticacaoSchema.parse(input);
    return new VincularAutenticacao(dados.lojistaId, dados.authUserId);
  }
}
