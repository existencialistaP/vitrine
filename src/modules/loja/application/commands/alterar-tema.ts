import { z } from "zod";
import {
  Estilo,
  FormatoCard,
  Layout,
  Paleta,
} from "../../domain/vos/identidade-visual";
import { Fonte } from "../../domain/vos/fonte";

const IdOpcao = (opcoes: readonly string[], mensagem: string) =>
  z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => opcoes.includes(v), { message: mensagem });

const AlterarTemaSchema = z.object({
  lojaId: z.string().uuid("lojaId deve ser um UUID"),
  paleta: IdOpcao(Object.values(Paleta), "Paleta inválida").optional(),
  estilo: IdOpcao(Object.values(Estilo), "Estilo inválido").optional(),
  formatoCard: IdOpcao(
    Object.values(FormatoCard),
    "Formato do card inválido"
  ).optional(),
  layout: IdOpcao(Object.values(Layout), "Layout inválido").optional(),
  fonte: IdOpcao(Object.values(Fonte), "Fonte inválida").optional(),
  logoUrl: z.string().url("logoUrl deve ser uma URL válida").nullable().optional(),
});

/** Comando para alterar a identidade visual da vitrine (RF-004). */
export class AlterarTema {
  private constructor(
    readonly lojaId: string,
    readonly paleta: string | undefined,
    readonly estilo: string | undefined,
    readonly formatoCard: string | undefined,
    readonly layout: string | undefined,
    readonly fonte: string | undefined,
    readonly logoUrl: string | null
  ) {}

  static from(input: unknown): AlterarTema {
    const dados = AlterarTemaSchema.parse(input);
    return new AlterarTema(
      dados.lojaId,
      dados.paleta,
      dados.estilo,
      dados.formatoCard,
      dados.layout,
      dados.fonte,
      dados.logoUrl ?? null
    );
  }
}
