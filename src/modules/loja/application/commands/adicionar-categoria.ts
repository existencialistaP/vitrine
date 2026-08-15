import { z } from "zod";

const AdicionarCategoriaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  nome: z
    .string()
    .trim()
    .min(2, "nome deve ter no mínimo 2 caracteres")
    .max(40, "nome deve ter no máximo 40 caracteres"),
});

/** Comando para criar uma categoria de produtos na vitrine. */
export class AdicionarCategoria {
  private constructor(
    readonly lojaId: string,
    readonly nome: string
  ) {}

  static from(input: unknown): AdicionarCategoria {
    const dados = AdicionarCategoriaSchema.parse(input);
    return new AdicionarCategoria(dados.lojaId, dados.nome);
  }
}
