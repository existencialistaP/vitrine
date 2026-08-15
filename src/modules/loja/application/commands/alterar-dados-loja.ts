import { z } from "zod";

const AlterarDadosLojaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  nome: z
    .string()
    .trim()
    .min(3, "nome deve ter no mínimo 3 caracteres")
    .max(60, "nome deve ter no máximo 60 caracteres")
    .optional(),
  descricao: z
    .string()
    .trim()
    .max(500, "descricao deve ter no máximo 500 caracteres")
    .optional(),
  whatsapp: z.string().trim().min(10, "whatsapp deve conter DDD + número").optional(),
  status: z.enum(["ATIVA", "INATIVA"]).optional(),
});

/** Comando para atualizar os dados cadastrais e o status da vitrine. */
export class AlterarDadosLoja {
  private constructor(
    readonly lojaId: string,
    readonly nome: string | undefined,
    readonly descricao: string | undefined,
    readonly whatsapp: string | undefined,
    readonly status: "ATIVA" | "INATIVA" | undefined
  ) {}

  static from(input: unknown): AlterarDadosLoja {
    const dados = AlterarDadosLojaSchema.parse(input);
    return new AlterarDadosLoja(
      dados.lojaId,
      dados.nome,
      dados.descricao,
      dados.whatsapp,
      dados.status
    );
  }
}
