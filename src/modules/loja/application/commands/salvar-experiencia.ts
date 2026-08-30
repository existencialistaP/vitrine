import { z } from "zod";
import { MAX_PAGINAS_EXPERIENCIA, PaginaSchema, type PaginaExperiencia } from "../../domain/vos/experiencia";

const SalvarExperienciaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  paginas: z.array(PaginaSchema).min(1).max(MAX_PAGINAS_EXPERIENCIA),
});

/** Comando para publicar a experiência (páginas em blocos) da vitrine. */
export class SalvarExperiencia {
  private constructor(
    readonly lojaId: string,
    readonly paginas: readonly PaginaExperiencia[]
  ) {}

  static from(input: unknown): SalvarExperiencia {
    const dados = SalvarExperienciaSchema.parse(input);
    return new SalvarExperiencia(dados.lojaId, dados.paginas);
  }
}