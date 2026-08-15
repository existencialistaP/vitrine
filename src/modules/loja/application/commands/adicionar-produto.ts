import { z } from "zod";

const AdicionarProdutoSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  nome: z
    .string()
    .trim()
    .min(2, "nome deve ter no mínimo 2 caracteres")
    .max(80, "nome deve ter no máximo 80 caracteres"),
  descricao: z
    .string()
    .trim()
    .max(500, "descricao deve ter no máximo 500 caracteres")
    .optional()
    .default(""),
  precoCents: z.number().int("precoCents deve ser inteiro").nonnegative("precoCents não pode ser negativo"),
  categoriaId: z.string().uuid("categoriaId deve ser um UUID").nullable().optional(),
  imagemUrl: z.string().url("imagemUrl deve ser uma URL válida").optional().nullable(),
  disponivel: z.boolean().optional().default(true),
});

/** Comando para adicionar um produto à vitrine (RF-002). */
export class AdicionarProduto {
  private constructor(
    readonly lojaId: string,
    readonly nome: string,
    readonly descricao: string,
    readonly precoCents: number,
    readonly categoriaId: string | null,
    readonly imagemUrl: string | null,
    readonly disponivel: boolean
  ) {}

  static from(input: unknown): AdicionarProduto {
    const dados = AdicionarProdutoSchema.parse(input);
    return new AdicionarProduto(
      dados.lojaId,
      dados.nome,
      dados.descricao,
      dados.precoCents,
      dados.categoriaId ?? null,
      dados.imagemUrl ?? null,
      dados.disponivel
    );
  }
}
