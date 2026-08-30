import { z } from "zod";
import type { BlocoExperiencia } from "../../domain/vos/experiencia";
import { MAX_BLOCOS_EXPERIENCIA } from "../../domain/vos/experiencia";

const BlocoSchema = z.object({
  id: z.string().trim().min(1, "id do bloco é obrigatório"),
  type: z.string().trim().min(1, "tipo do bloco é obrigatório"),
  label: z.string(),
  visible: z.boolean(),
  props: z.record(z.string(), z.unknown()),
});

const SalvarExperienciaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  blocos: z.array(BlocoSchema).max(MAX_BLOCOS_EXPERIENCIA),
});

/** Comando para publicar a experiência (página em blocos) da vitrine. */
export class SalvarExperiencia {
  private constructor(
    readonly lojaId: string,
    readonly blocos: readonly BlocoExperiencia[]
  ) {}

  static from(input: unknown): SalvarExperiencia {
    const dados = SalvarExperienciaSchema.parse(input);
    return new SalvarExperiencia(dados.lojaId, dados.blocos);
  }
}