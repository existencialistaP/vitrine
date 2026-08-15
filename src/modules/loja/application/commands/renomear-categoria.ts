import { z } from "zod";

const RenomearCategoriaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  categoriaId: z.string().uuid("categoriaId deve ser um UUID"),
  nome: z
    .string()
    .trim()
    .min(2, "nome deve ter no mínimo 2 caracteres")
    .max(40, "nome deve ter no máximo 40 caracteres"),
});

/** Comando para renomear uma categoria existente. */
export class RenomearCategoria {
  private constructor(
    readonly lojaId: string,
    readonly categoriaId: string,
    readonly nome: string
  ) {}

  static from(input: unknown): RenomearCategoria {
    const dados = RenomearCategoriaSchema.parse(input);
    return new RenomearCategoria(dados.lojaId, dados.categoriaId, dados.nome);
  }
}
