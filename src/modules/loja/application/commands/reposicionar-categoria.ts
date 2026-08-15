import { z } from "zod";

const ReposicionarCategoriaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  categoriaId: z.string().uuid("categoriaId deve ser um UUID"),
  ordem: z.number().int("ordem deve ser inteira").nonnegative("ordem não pode ser negativa"),
});

/** Comando para reposicionar uma categoria na vitrine. */
export class ReposicionarCategoria {
  private constructor(
    readonly lojaId: string,
    readonly categoriaId: string,
    readonly ordem: number
  ) {}

  static from(input: unknown): ReposicionarCategoria {
    const dados = ReposicionarCategoriaSchema.parse(input);
    return new ReposicionarCategoria(dados.lojaId, dados.categoriaId, dados.ordem);
  }
}
