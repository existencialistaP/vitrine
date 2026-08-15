import { z } from "zod";

const AtualizarProdutoSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  produtoId: z.string().uuid("produtoId deve ser um UUID"),
  nome: z
    .string()
    .trim()
    .min(2, "nome deve ter no mínimo 2 caracteres")
    .max(80, "nome deve ter no máximo 80 caracteres")
    .optional(),
  descricao: z
    .string()
    .trim()
    .max(500, "descricao deve ter no máximo 500 caracteres")
    .optional(),
  precoCents: z.number().int("precoCents deve ser inteiro").nonnegative("precoCents não pode ser negativo").optional(),
  categoriaId: z.string().uuid("categoriaId deve ser um UUID").nullable().optional(),
  imagemUrl: z.string().url("imagemUrl deve ser uma URL válida").nullable().optional(),
});

/** Comando para atualizar um produto existente (RF-002). */
export class AtualizarProduto {
  private constructor(
    readonly lojaId: string,
    readonly produtoId: string,
    readonly nome: string | undefined,
    readonly descricao: string | undefined,
    readonly precoCents: number | undefined,
    readonly categoriaId: string | null | undefined,
    readonly imagemUrl: string | null | undefined
  ) {}

  static from(input: unknown): AtualizarProduto {
    const dados = AtualizarProdutoSchema.parse(input);
    return new AtualizarProduto(
      dados.lojaId,
      dados.produtoId,
      dados.nome,
      dados.descricao,
      dados.precoCents,
      dados.categoriaId,
      dados.imagemUrl
    );
  }
}
