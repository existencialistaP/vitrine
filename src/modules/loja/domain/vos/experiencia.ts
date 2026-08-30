import { z } from "zod";
import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class ExperienciaInvalida extends InvalidDomainError {
  readonly code = "EXPERIENCIA_INVALIDA";

  constructor(motivo: string) {
    super(`A experiência da vitrine é inválida: ${motivo}.`);
  }
}

export const MAX_BLOCOS_EXPERIENCIA = 100;
export const MAX_PAGINAS_EXPERIENCIA = 30;
export const MAX_ROTULO_PAGINA = 24;

export const blockTypes = [
  "hero", "richText", "imageText", "productCollection", "categoryCollection",
  "about", "banner", "cta", "testimonials", "faq", "gallery", "spacer", "divider",
] as const;
export type BlockType = (typeof blockTypes)[number];

export interface BlocoExperiencia {
  id: string;
  type: BlockType;
  label: string;
  visible: boolean;
  props: Record<string, unknown>;
}

export interface PaginaExperiencia {
  id: string;
  rotulo: string;
  ordem: number;
  blocos: BlocoExperiencia[];
}

const ordenacao = z.enum(["newest", "priceAsc", "priceDesc", "name", "manual"]);
const modo = z.enum(["manual", "automatic", "hybrid"]);

/** Schema estrito de props por tipo: remove chaves desconhecidas e aplica defaults. */
export const propSchemas = {
  hero: z.object({
    title: z.string().default("Sua marca, do seu jeito"),
    description: z.string().default(""),
    action: z.string().default("Ver produtos"),
    buttonVisible: z.boolean().default(true),
  }),
  richText: z.object({
    title: z.string().default(""),
    body: z.string().default(""),
    align: z.enum(["left", "center"]).default("left"),
  }),
  imageText: z.object({
    title: z.string().default(""),
    body: z.string().default(""),
    imageUrl: z.string().nullable().default(null),
    imageSide: z.enum(["left", "right"]).default("right"),
  }),
  productCollection: z.object({
    title: z.string().default("Mais pedidos"),
    mode: modo.default("hybrid"),
    order: ordenacao.default("newest"),
    categoryId: z.string().nullable().default(null),
    manualIds: z.array(z.string()).default([]),
    limit: z.number().int().min(1).max(50).default(8),
  }),
  categoryCollection: z.object({
    title: z.string().default("Explore por categoria"),
    limit: z.number().int().min(1).max(12).default(6),
  }),
  about: z.object({
    title: z.string().default("Sobre a marca"),
    body: z.string().default(""),
  }),
  banner: z.object({
    title: z.string().default("Promoção especial"),
    description: z.string().default(""),
    action: z.string().default("Falar com a marca"),
  }),
  cta: z.object({
    title: z.string().default("Fale com a nossa marca"),
    description: z.string().default(""),
    action: z.string().default("Chamar no WhatsApp"),
  }),
  testimonials: z.object({
    title: z.string().default("O que dizem nossos clientes"),
    items: z.array(z.object({ nome: z.string().default(""), texto: z.string().default("") })).default([]),
  }),
  faq: z.object({
    title: z.string().default("Perguntas frequentes"),
    items: z.array(z.object({ pergunta: z.string().default(""), resposta: z.string().default("") })).default([]),
  }),
  gallery: z.object({
    title: z.string().default("Galeria"),
    images: z.array(z.string()).default([]),
  }),
  spacer: z.object({ height: z.number().int().min(4).max(160).default(32) }),
  divider: z.object({}),
} as const;
export type BlocoPropsSchema = typeof propSchemas;

function blocoSchema(type: BlockType) {
  return z.object({
    id: z.string().min(1, "id do bloco é obrigatório"),
    type: z.literal(type),
    label: z.string(),
    visible: z.boolean(),
    props: (propSchemas as Record<BlockType, z.ZodType<Record<string, unknown>>>)[type],
  });
}

export const BlocoSchema: z.ZodType<BlocoExperiencia> = z.discriminatedUnion(
  "type",
  blockTypes.map((type) => blocoSchema(type)) as never
);

export const PaginaSchema: z.ZodType<PaginaExperiencia> = z.object({
  id: z.string().min(1, "id da página é obrigatório"),
  rotulo: z.string().trim().min(1, "rotulo é obrigatório").max(MAX_ROTULO_PAGINA),
  ordem: z.number().int().min(0).default(0),
  blocos: z.array(BlocoSchema).max(MAX_BLOCOS_EXPERIENCIA),
});

export const ExperienciaSchema = z.object({
  versao: z.literal(2),
  paginas: z.array(PaginaSchema).min(1).max(MAX_PAGINAS_EXPERIENCIA),
});

function aoErroDomínio(erro: unknown): ExperienciaInvalida {
  if (erro instanceof ExperienciaInvalida) return erro;
  if (erro instanceof z.ZodError) return new ExperienciaInvalida(erro.issues[0]?.message ?? "dados inválidos");
  return new ExperienciaInvalida("dados inesperados");
}

/** Documento v2 da página da vitrine (páginas-camadas em blocos). */
export class Experiencia implements ValueObject {
  private constructor(private readonly paginas: readonly PaginaExperiencia[]) {}

  static vazia(): Experiencia {
    return new Experiencia([]);
  }

  static dePaginas(paginas: readonly PaginaExperiencia[]): Experiencia {
    try {
      const validado = ExperienciaSchema.parse({ versao: 2, paginas });
      return new Experiencia(
        validado.paginas.map((pagina) => ({
          ...pagina,
          blocos: pagina.blocos.map((bloco) => ({ ...bloco, props: { ...bloco.props } })),
        }))
      );
    } catch (erro) {
      throw aoErroDomínio(erro);
    }
  }

  static deJson(valor: unknown): Experiencia {
    if (valor === null || valor === undefined) return Experiencia.vazia();
    if (Array.isArray(valor)) {
      try {
        const blocos = valor.map((bloco) => BlocoSchema.parse(bloco));
        return Experiencia.dePaginas([
          { id: "home-1", rotulo: "Home", ordem: 0, blocos },
        ]);
      } catch (erro) {
        throw aoErroDomínio(erro);
      }
    }
    try {
      return Experiencia.dePaginas(ExperienciaSchema.parse(valor).paginas);
    } catch (erro) {
      throw aoErroDomínio(erro);
    }
  }

  getPaginas(): readonly PaginaExperiencia[] {
    return Object.freeze([...this.paginas]);
  }

  isEmpty(): boolean {
    return this.paginas.length === 0;
  }

  paraJson(): { versao: 2; paginas: PaginaExperiencia[] } {
    return {
      versao: 2,
      paginas: this.paginas.map((pagina) => ({
        ...pagina,
        blocos: pagina.blocos.map((bloco) => ({ ...bloco, props: { ...bloco.props } })),
      })),
    };
  }

  equals(other: unknown): boolean {
    return other instanceof Experiencia && JSON.stringify(other.paginas) === JSON.stringify(this.paginas);
  }
}