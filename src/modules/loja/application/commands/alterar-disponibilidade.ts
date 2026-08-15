import { z } from "zod";

const AlterarDisponibilidadeSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  produtoId: z.string().uuid("produtoId deve ser um UUID"),
  disponivel: z.boolean(),
});

/** Comando para exibir/ocultar um produto da vitrine. */
export class AlterarDisponibilidade {
  private constructor(
    readonly lojaId: string,
    readonly produtoId: string,
    readonly disponivel: boolean
  ) {}

  static from(input: unknown): AlterarDisponibilidade {
    const dados = AlterarDisponibilidadeSchema.parse(input);
    return new AlterarDisponibilidade(dados.lojaId, dados.produtoId, dados.disponivel);
  }
}
