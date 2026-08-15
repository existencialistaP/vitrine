import { z } from "zod";

/** Entrada bruta validada na fronteira (equivalent ao {@code @Valid}). */
const CadastrarLojistaSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "nome deve ter no mínimo 3 caracteres")
    .max(120, "nome deve ter no máximo 120 caracteres"),
  email: z.string().trim().email("e-mail inválido"),
  telefone: z
    .string()
    .trim()
    .min(10, "telefone deve ter DDD + número")
    .optional()
    .nullable(),
  authUserId: z.string().trim().min(1, "identificador de autenticação é obrigatório").optional(),
});

/**
 * Comando para cadastrar um novo lojista (RF-001).
 */
export class CadastrarLojista {
  private constructor(
    readonly nome: string,
    readonly email: string,
    readonly telefone: string | null,
    readonly authUserId: string | undefined
  ) {}

  static from(input: unknown): CadastrarLojista {
    const dados = CadastrarLojistaSchema.parse(input);
    return new CadastrarLojista(
      dados.nome,
      dados.email,
      dados.telefone ?? null,
      dados.authUserId
    );
  }
}
