import { z } from "zod";

const CriarLojaSchema = z.object({
  lojistaId: z.string().uuid("lojistaId deve ser um UUID"),
  nome: z
    .string()
    .trim()
    .min(3, "nome deve ter no mínimo 3 caracteres")
    .max(60, "nome deve ter no máximo 60 caracteres"),
  descricao: z
    .string()
    .trim()
    .max(500, "descricao deve ter no máximo 500 caracteres")
    .optional()
    .default(""),
  whatsapp: z.string().trim().min(10, "whatsapp deve conter DDD + número"),
  slug: z.string().trim().min(3, "slug deve ter no mínimo 3 caracteres").optional(),
});

/** Comando para criar a vitrine de um lojista (vínculo de exclusividade). */
export class CriarLoja {
  private constructor(
    readonly lojistaId: string,
    readonly nome: string,
    readonly descricao: string,
    readonly whatsapp: string,
    readonly slug: string | undefined
  ) {}

  static from(input: unknown): CriarLoja {
    const dados = CriarLojaSchema.parse(input);
    return new CriarLoja(
      dados.lojistaId,
      dados.nome,
      dados.descricao,
      dados.whatsapp,
      dados.slug
    );
  }
}
