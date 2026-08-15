import { z } from "zod";

const RemoverCategoriaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  categoriaId: z.string().uuid("categoriaId deve ser um UUID"),
});

/** Comando para remover uma categoria (produtos são desvinculados). */
export class RemoverCategoria {
  private constructor(
    readonly lojaId: string,
    readonly categoriaId: string
  ) {}

  static from(input: unknown): RemoverCategoria {
    const dados = RemoverCategoriaSchema.parse(input);
    return new RemoverCategoria(dados.lojaId, dados.categoriaId);
  }
}
