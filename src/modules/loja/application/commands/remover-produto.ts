import { z } from "zod";

const RemoverProdutoSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  produtoId: z.string().uuid("produtoId deve ser um UUID"),
});

/** Comando para remover um produto da vitrine (RF-002). */
export class RemoverProduto {
  private constructor(
    readonly lojaId: string,
    readonly produtoId: string
  ) {}

  static from(input: unknown): RemoverProduto {
    const dados = RemoverProdutoSchema.parse(input);
    return new RemoverProduto(dados.lojaId, dados.produtoId);
  }
}
