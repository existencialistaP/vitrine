import { z } from "zod";

const AlterarTemaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  corPrimaria: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "corPrimaria deve ser hexadecimal (#RGB/#RRGGBB)"),
  corSecundaria: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "corSecundaria deve ser hexadecimal (#RGB/#RRGGBB)"),
  corFundo: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "corFundo deve ser hexadecimal (#RGB/#RRGGBB)"),
  fonte: z.enum(["SANS", "SERIF", "MONO"]).optional(),
  logoUrl: z.string().url("logoUrl deve ser uma URL válida").nullable().optional(),
});

/** Comando para alterar a identidade visual da vitrine (RF-004). */
export class AlterarTema {
  private constructor(
    readonly lojaId: string,
    readonly corPrimaria: string,
    readonly corSecundaria: string,
    readonly corFundo: string,
    readonly fonte: "SANS" | "SERIF" | "MONO" | undefined,
    readonly logoUrl: string | null
  ) {}

  static from(input: unknown): AlterarTema {
    const dados = AlterarTemaSchema.parse(input);
    return new AlterarTema(
      dados.lojaId,
      dados.corPrimaria,
      dados.corSecundaria,
      dados.corFundo,
      dados.fonte,
      dados.logoUrl ?? null
    );
  }
}
