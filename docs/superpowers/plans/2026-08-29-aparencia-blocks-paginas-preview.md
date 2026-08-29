# Construtor de páginas em camadas, personalização de blocos e preview ao vivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar `loja.experiencia` num documento de páginas-camadas (v2), dar conteúdo editável a cada bloco, renderizar as 13 block types, adicionar navegação por abas na vitrine pública e uma preview ao vivo no construtor.

**Architecture:** Coluna JSON única `loja.experiencia` vira `{ versao: 2, paginas: [...] }` com migração automática do formato legado (array plano v1). O VO `Experiencia` torna-se fonte de verdade dos schemas por bloco (zod). A UI usa o mesmo `Storefront` real para a preview. Nenhuma mudança de schema/migração.

**Tech Stack:** Next.js 16 (App Router) · Tailwind v4 · shadcn/ui `base-nova` (`@base-ui/react`) · react-hook-form + zod · lucide-react · vitest.

**Spec:** `docs/superpowers/specs/2026-08-29-aparencia-blocks-paginas-preview-spec.md` (fonte de verdade; todas as decisões vieram daquela spec e do brainstorming aprovado).

## Global Constraints

- Não há mudança de schema Prisma / nenhuma migração; coluna `loja.experiencia` permanece a única fonte de persistência.
- Tokenização: nunca usar cores/raios/px arbitrários; usar tokens semânticos (`bg-muted`, `rounded-lg`, `text-destructive`); sem `dark:` manual.
- Sem `space-x-*`/`space-y-*`: usar `flex` + `gap-*`. Dimensões iguais: `size-*`.
- Ícones: `Button` com `data-icon="inline-start"/"inline-end"`; sem `size-*` manual em ícones de botão.
- Loading em botão: `Spinner` + `data-icon` + `disabled`.
- Verificação por task: `npm run typecheck`; `npm run lint`; `npm run test` (vitest).
- Domínio não importa de `@/lib`. `src/lib/experience.ts` re-exporta tipos do domínio (import domínio→lib é permitido; lib→UI idem).
- `zod` entra no VO `experiencia.ts` (decisão deliberada da spec: schema por bloco é fonte da verdade no domínio; zod já é dependência do projeto).
- `BlocoExperiencia` mantém `props: Record<string, unknown>` (shape frouxo) para ergonomia dos consumidores; os schemas estritos por tipo existem apenas para validação/saneamento.
- Nomes/id em português, padrão do repo (`rotulo`, `paginas`, `carregar*Action`).

---

### Task A: Domínio v2 + pipeline de persistência (VO, comando, service, actions, vitrine-view)

**Files:**
- Rewrite: `src/modules/loja/domain/vos/experiencia.ts`
- Modify: `src/modules/loja/application/commands/salvar-experiencia.ts`
- Modify: `src/modules/loja/application/loja-service.ts`
- Modify: `src/app/actions/experiencia.ts`
- Modify: `src/lib/vitrine-view.ts`
- Test: `tests/unit/vos/experiencia.test.ts` (create)
- Test: `tests/unit/application/loja-service.test.ts` (extend)

**Interfaces produced (consumidas por Tasks B–H):**
- `type BlockType` (13 valores)
- `type BlocoExperiencia = { id: string; type: BlockType; label: string; visible: boolean; props: Record<string, unknown> }`
- `type PaginaExperiencia = { id: string; rotulo: string; ordem: number; blocos: BlocoExperiencia[] }`
- `propSchemas: Record<BlockType, z.ZodObject<any>>` (schemas estritos por tipo, com defaults)
- `BlocoSchema: z.ZodType<BlocoExperiencia>`, `PaginaSchema: z.ZodType<PaginaExperiencia>`, `ExperienciaSchema`
- `MAX_BLOCOS_EXPERIENCIA = 100`, `MAX_PAGINAS_EXPERIENCIA = 30`, `MAX_ROTULO_PAGINA = 24`
- `Experiencia.vazia() | dePaginas(paginas) | deJson(valor) | getPaginas() | isEmpty() | equals() | paraJson(): { versao: 2; paginas: PaginaExperiencia[] }`
- `CarregarExperienciaResultado = { ok: true; paginas: PaginaExperiencia[] } | { ok: false; error: string }`
- `SalvarExperienciaResultado = { ok: true } | { ok: false; error: string }`
- `carregarExperienciaAction(): Promise<CarregarExperienciaResultado>` (retorna `paginas`, fallback `initialPages`)
- `salvarExperienciaAction(paginas: unknown): Promise<SalvarExperienciaResultado>`
- `carregarBasePreviewAction(): Promise<{ ok: true; base: VitrineBase } | { ok: false; error: string }>`
- `type VitrineBase = Omit<VitrineView, "paginas">` + `serializeVitrineBase(vitrine: VitrineCatalogo): VitrineBase`
- `VitrineView` passa a ter `paginas: PaginaExperiencia[]` (remove `blocos`).

- [ ] **Step 1: Escrever o teste que falha** — `tests/unit/vos/experiencia.test.ts`

```ts
import { describe, it, expect } from "vitest";
import {
  Experiencia,
  ExperienciaInvalida,
  MAX_PAGINAS_EXPERIENCIA,
} from "@/modules/loja/domain/vos/experiencia";

const bloco = (extra: Record<string, unknown> = {}) => ({
  id: "hero-1",
  type: "hero",
  label: "Hero",
  visible: true,
  props: { title: "Oi" },
  ...extra,
});

const paginaHome = () => ({
  id: "home-1",
  rotulo: "Home",
  ordem: 0,
  blocos: [bloco()],
});

describe("Experiencia (documento v2)", () => {
  it("deJson(null) é vazia", () => {
    expect(Experiencia.deJson(null).isEmpty()).toBe(true);
  });

  it("migra array legado v1 para uma página Home", () => {
    const experiencia = Experiencia.deJson([bloco()]);
    const paginas = experiencia.getPaginas();
    expect(paginas).toHaveLength(1);
    expect(paginas[0].rotulo).toBe("Home");
    expect(paginas[0].blocos).toHaveLength(1);
  });

  it("dePaginas valida documento v2", () => {
    const experiencia = Experiencia.dePaginas([paginaHome()]);
    const p = experiencia.getPaginas()[0];
    expect(p.blocos[0].props.title).toBe("Oi");
    expect(experiencia.paraJson().versao).toBe(2);
    expect(experiencia.getPaginas()).toHaveLength(1);
  });

  it("rejeita mais de 30 páginas", () => {
    const muitas = Array.from({ length: MAX_PAGINAS_EXPERIENCIA + 1 }, (_, i) => ({
      id: `p-${i}`,
      rotulo: `P${i}`,
      ordem: i,
      blocos: [],
    }));
    expect(() => Experiencia.dePaginas(muitas)).toThrow(ExperienciaInvalida);
  });

  it("rejeita rótulo vazio", () => {
    expect(() =>
      Experiencia.dePaginas([{ ...paginaHome(), rotulo: "  " }])
    ).toThrow(ExperienciaInvalida);
  });

  it("saneia props: remove chave desconhecida e aplica default", () => {
    const experiencia = Experiencia.dePaginas([
      { ...paginaHome(), blocos: [bloco({ props: { foo: "bar" } })] },
    ]);
    const props = experiencia.getPaginas()[0].blocos[0].props;
    expect(props).not.toHaveProperty("foo");
    expect(props.title).toBe("Oi");
    expect(typeof props.buttonVisible).toBe("boolean");
  });

  it("rejeita tipo de bloco desconhecido", () => {
    expect(() =>
      Experiencia.dePaginas([
        { ...paginaHome(), blocos: [bloco({ type: "naoExiste" })] },
      ])
    ).toThrow(ExperienciaInvalida);
  });

  it("isenção: deJson com formato inválido lança", () => {
    expect(() => Experiencia.deJson({ qualquer: 1 })).toThrow(ExperienciaInvalida);
  });
});
```

- [ ] **Step 2: Rodar para ver falhar**
  Run: `npm run test -- tests/unit/vos/experiencia.test.ts`
  Expected: FAIL — `Experiencia.dePaginas` não existe (`deBlocos` atual).

- [ ] **Step 3: Reescrever o VO de domínio** — `src/modules/loja/domain/vos/experiencia.ts`

```ts
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

const zeros = 0;
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
    props: (propSchemas as Record<BlockType, z.ZodObject<any>>)[type],
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
```

- [ ] **Step 4: Atualizar comando** — `src/modules/loja/application/commands/salvar-experiencia.ts`

```ts
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
```

- [ ] **Step 5: Atualizar service** — `src/modules/loja/application/loja-service.ts` (trocar o corpo de `salvarExperiencia`, linhas ~238-242)

```ts
  private async salvarExperiencia(cmd: SalvarExperiencia): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));
    loja.alterarExperiencia(Experiencia.dePaginas(cmd.paginas));
    await this.persistir(loja);
  }
```

- [ ] **Step 6: Atualizar actions** — `src/app/actions/experiencia.ts` (inteiro)

```ts
"use server"

import { revalidatePath } from "next/cache"

import { container, requireMinhaLoja } from "@/lib/loja"
import { initialPages, type PaginaExperiencia } from "@/lib/experience"
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia"
import { serializeVitrineBase } from "@/lib/vitrine-view"

export type CarregarExperienciaResultado =
  | { ok: true; paginas: PaginaExperiencia[] }
  | { ok: false; error: string }

export type SalvarExperienciaResultado =
  | { ok: true }
  | { ok: false; error: string }

export type CarregarBasePreviewResultado =
  | { ok: true; base: ReturnType<typeof serializeVitrineBase> }
  | { ok: false; error: string }

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof Error) return erro.message
  return "Ocorreu um erro inesperado."
}

/** Carrega as páginas publicadas da vitrine (ou o template inicial). */
export async function carregarExperienciaAction(): Promise<CarregarExperienciaResultado> {
  try {
    const loja = await requireMinhaLoja()
    const paginas = loja.getExperiencia().getPaginas()
    return {
      ok: true,
      paginas: (paginas.length > 0 ? paginas : initialPages) as Pick<PaginaExperiencia, "id" | "rotulo" | "ordem" | "blocos">[],
    }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

/** Publica as páginas da vitrine construídas no construtor. */
export async function salvarExperienciaAction(
  paginas: unknown
): Promise<SalvarExperienciaResultado> {
  const loja = await requireMinhaLoja()
  try {
    await container.lojaService.handle(
      SalvarExperiencia.from({
        lojaId: loja.getId().toUUID(),
        paginas,
      })
    )
    const slug = loja.getSlug().getValue()
    revalidatePath("/dashboard/aparencia")
    revalidatePath(`/${slug}`)
    return { ok: true }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

/** Carrega os dados (tema, produtos, categorias, identidade) para a preview ao vivo. */
export async function carregarBasePreviewAction(): Promise<CarregarBasePreviewResultado> {
  try {
    const loja = await requireMinhaLoja()
    const vitrine = await container.catalogoService.listarPorId(loja.getId().toUUID())
    return { ok: true, base: serializeVitrineBase(vitrine) }
  } catch (erro) {
    return { ok: false, error: mensagemDeErro(erro) }
  }
}

```ts
import type { VitrineCatalogo } from "@/modules/catalogo/application/dto/catalogo-dto"
import { initialPages, type PaginaExperiencia } from "@/lib/experience"
import { obterPaleta } from "@/lib/visual"

/** Representação serializável dos dados fixos da vitrine (sem as páginas). */
export type VitrineBase = Omit<VitrineView, "paginas">
```

E refatorar: extrair `serializeVitrineBase(vitrine): VitrineBase` com todo o corpo atual MENOS o bloco `blocos`; `serializeVitrine` fica:

```ts
export function serializeVitrine(vitrine: VitrineCatalogo): VitrineView {
  const paginas = vitrine.experiencia.getPaginas()
  return {
    ...serializeVitrineBase(vitrine),
    paginas: (paginas.length > 0 ? paginas : initialPages) as PaginaExperiencia[],
  }
}
```

Remover o campo `blocos` do tipo `VitrineView` e adicionar `paginas: PaginaExperiencia[]`.

- [ ] **Step 8: Estender testes do service** — no fim de `tests/unit/application/loja-service.test.ts`

```ts
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia";

it("publica experiência v2 (páginas em blocos)", async () => {
  const lojaId = await service.handle(
    CriarLoja.from({ lojistaId: lojistaId(), nome: "Café da Esquina", whatsapp: "41999998888" })
  );

  await service.handle(
    SalvarExperiencia.from({
      lojaId: lojaId.toUUID(),
      paginas: [
        { id: "home-1", rotulo: "Home", ordem: 0, blocos: [{
          id: "hero-1", type: "hero", label: "Hero", visible: true,
          props: { title: "Cafés especiais" },
        }] },
        { id: "sobre-1", rotulo: "Sobre", ordem: 1, blocos: [{
          id: "faq-1", type: "faq", label: "FAQ", visible: true,
          props: { title: "Dúvidas", items: [{ pergunta: "Envia?", resposta: "Sim" }] },
        }] },
      ],
    })
  );

  const loja = await repository.findById(lojaId);
  const paginas = loja?.getExperiencia().getPaginas();
  expect(paginas).toHaveLength(2);
  expect(paginas?.[0].blocos[0].props.title).toBe("Cafés especiais");
  expect(paginas?.[1].blocos[0].props.items).toHaveLength(1);
});
```

- [ ] **Step 9: Rodar testes** — `npm run test`
  Expected: PASS (novo + existentes).

- [ ] **Step 10: Commit**

```bash
git add src/modules/loja/domain/vos/experiencia.ts src/modules/loja/application/commands/salvar-experiencia.ts src/modules/loja/application/loja-service.ts src/app/actions/experiencia.ts src/lib/vitrine-view.ts tests/unit/vos/experiencia.test.ts tests/unit/application/loja-service.test.ts
git commit -m "feat: experiência v2 — páginas em blocos com schema por tipo"
```

---

### Task B: `lib/experience.ts` — re-exports de domínio, `initialPages`, `resolveProductSection` com modo

**Files:**
- Modify: `src/lib/experience.ts`

**Interfaces consumed:** tipos do domínio (Task A), `propSchemas`.
**Interfaces produced:**
- `initialPages: PaginaExperiencia[]` (página "Home" com `initialBlocks`)
- `templates(): { id: string; label: string; description: string; paginas: PaginaExperiencia[] }[]`
- `resolveProductSection(products, props)` — passa a honrar `mode` (`manual` | `automatic` | `hybrid`)

- [ ] **Step 1: Reescrever `src/lib/experience.ts` (topo)**

```ts
import { z } from "zod"

import {
  blockTypes,
  propSchemas,
  type BlockType,
  type BlocoExperiencia,
  type PaginaExperiencia,
} from "@/modules/loja/domain/vos/experiencia"

export type { BlockType, BlocoExperiencia, PaginaExperiencia } from "@/modules/loja/domain/vos/experiencia"
export { propSchemas } from "@/modules/loja/domain/vos/experiencia"
export type ExperienceBlock = BlocoExperiencia
```

Manter do arquivo atual (inalterados): `StorePlan`, `blockSchema` (frouxo), `initialBlocks`, `blockCatalog`, `planCapabilities`, `moveBlock`, `duplicateBlock`, `createBlock`, `blockTypeLabel`. Ajustar `blockSchema` para `z.object({ id: z.string(), type: z.enum(blockTypes), label: z.string(), visible: z.boolean(), props: z.record(z.string(), z.unknown()) })`.

- [ ] **Step 2: Adicionar `initialPages` e `templates()` (fim do arquivo)**

```ts
export const initialPages: PaginaExperiencia[] = [
  { id: "home-1", rotulo: "Home", ordem: 0, blocos: initialBlocks },
]

export function templates(): { id: string; label: string; description: string; paginas: PaginaExperiencia[] }[] {
  return [
    { id: "catalog", label: "Home de catálogo", description: "Hero, categorias, produtos e CTA.", paginas: initialPages },
    { id: "sobre", label: "Sobre nós", description: "Uma página para história e valores.", paginas: [{ id: "sobre-1", rotulo: "Sobre", ordem: 0, blocos: [initialBlocks[0], initialBlocks[3]] }] },
    { id: "promocao", label: "Landing promocional", description: "Banner, coleção filtrada e CTA.", paginas: [{ id: "promo-1", rotulo: "Promoção", ordem: 0, blocos: [createBlock("banner"), initialBlocks[2], createBlock("cta")] }] },
  ]
}
```

Remover o antigo `pageTemplates()` (substituído por `templates()`).

- [ ] **Step 3: Substituir `resolveProductSection` por versão que honra `mode`**

```ts
export function resolveProductSection(
  products: Array<{ id: string; nome: string; precoCents: number; categoriaId: string | null; disponivel?: boolean; criadoEm?: string }>,
  props: Record<string, unknown>
) {
  const manualIds = Array.isArray(props.manualIds) ? props.manualIds.filter((id): id is string => typeof id === "string") : []
  const categoryId = typeof props.categoryId === "string" ? props.categoryId : null
  const limit = typeof props.limit === "number" ? Math.max(1, Math.min(props.limit, 50)) : 8
  const order = props.order
  const mode = props.mode === "manual" || props.mode === "automatic" || props.mode === "hybrid" ? props.mode : "hybrid"

  const eligible = products.filter(
    (product) => product.disponivel !== false && (!categoryId || product.categoriaId === categoryId)
  )

  const manual = manualIds.map((id) => eligible.find((product) => product.id === id)).filter(Boolean)

  const compor = (a: { precoCents: number; nome: string; criadoEm?: string }, b: { precoCents: number; nome: string; criadoEm?: string }) => {
    if (order === "priceAsc") return a.precoCents - b.precoCents
    if (order === "priceDesc") return b.precoCents - a.precoCents
    if (order === "name") return a.nome.localeCompare(b.nome)
    return (b.criadoEm ?? "").localeCompare(a.criadoEm ?? "")
  }

  const semManuais = eligible.filter((product) => !manualIds.includes(product.id)).sort(compor)

  if (mode === "manual") return manual.slice(0, limit)
  if (mode === "automatic") return semManuais.slice(0, limit)

  const restante = Math.max(0, limit - manual.length)
  return [...manual, ...semManuais.slice(0, restante)]
}
```

> Nota: `semManuais` exclui os `manualIds` (para o hybrid não duplicar itens).

- [ ] **Step 4: Rodar typecheck/lint/test** — `npm run typecheck && npm run lint && npm run test`
  Expected: PASS (Face B não quebra nada — renderer/storefront ainda usam a API antiga).

- [ ] **Step 5: Commit**

```bash
git add src/lib/experience.ts
git commit -m "feat: lib de experiência com initialPages, templates e resolveProductSection por modo"
```

---

### Task C: Renderer — 13 block types + `preview` flag

**Files:**
- Modify: `src/components/features/vitrine/experience-renderer.tsx`

**Interfaces consumed:** `BlocoExperiencia`, `resolveProductSection` (Task B).
**Interfaces produced:** `ExperienceRenderer({ blocks, vitrine, onAdd?, preview? })` — `onAdd` e `preview` opcionais.

- [ ] **Step 1: Reescrever `experience-renderer.tsx`**

```tsx
'use client'

import { MessageCircle, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { resolveProductSection, type BlocoExperiencia } from '@/lib/experience'
import type { VitrineView } from '@/lib/vitrine-view'

function Envolver({ bloco, preview, children }: { bloco: BlocoExperiencia; preview?: boolean; children: React.ReactNode }) {
  if (!bloco.visible) {
    if (!preview) return null
    return (
      <div className="rounded-xl opacity-40 ring-1 ring-dashed ring-border" aria-label={`Bloco oculto: ${bloco.label}`}>
        {children}
      </div>
    )
  }
  return <>{children}</>
}

export function ExperienceRenderer({
  blocks,
  vitrine,
  onAdd,
  preview = false,
}: {
  blocks: BlocoExperiencia[]
  vitrine: VitrineView
  onAdd?: (product: VitrineView['produtos'][number]) => void
  preview?: boolean
}) {
  return (
    <div className="flex flex-col gap-12">
      {blocks.map((block) => (
        <Envolver key={block.id} bloco={block} preview={preview}>
          {renderizar(block, vitrine, onAdd)}
        </Envolver>
      ))}
    </div>
  )
}

function renderizar(block: BlocoExperiencia, vitrine: VitrineView, onAdd?: (product: VitrineView['produtos'][number]) => void) {
  const texto = (chave: string, fallback: string) => String(block.props[chave] ?? fallback)

  switch (block.type) {
    case 'hero':
      return (
        <section className="flex flex-col items-center gap-5 py-12 text-center sm:py-16">
          <div className="flex items-center gap-2 text-sm font-medium text-(--vitrine-primary)"><Sparkles aria-hidden="true" />Uma experiência feita para você</div>
          <h1 className="max-w-2xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">{texto('title', vitrine.nome)}</h1>
          <p className="max-w-xl text-balance text-base text-muted-foreground sm:text-lg">{texto('description', vitrine.descricao)}</p>
          {block.props.buttonVisible !== false && (
            <a href={vitrine.whatsappLink} target="_blank" rel="noreferrer"><Button size="lg"><MessageCircle data-icon="inline-start" />{texto('action', 'Vamos conversar')}</Button></a>
          )}
        </section>
      )

    case 'richText':
    case 'about':
      return (
        <section className={`mx-auto max-w-2xl py-4 ${block.props.align === 'center' ? 'text-center' : ''}`}>
          <Card>
            <CardHeader><CardTitle>{texto('title', block.label)}</CardTitle></CardHeader>
            <CardContent><p className="whitespace-pre-line text-muted-foreground leading-relaxed">{texto('body', texto('description', 'Conte a história da sua marca.'))}</p></CardContent>
          </Card>
        </section>
      )

    case 'imageText': {
      const lado = block.props.imageSide === 'left'
      const imagemUrl = typeof block.props.imageUrl === 'string' ? block.props.imageUrl : null
      return (
        <section className={`flex flex-col gap-6 py-6 md:grid md:grid-cols-2 md:items-center`}>
          {lado && imagemUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt={texto('title', '')} className="aspect-[4/3] w-full rounded-lg object-cover" />
          )}
          <div className={lado ? '' : 'md:order-2'}>
            <h2 className="font-heading text-2xl font-semibold">{texto('title', '')}</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground leading-relaxed">{texto('body', '')}</p>
          </div>
          {!lado && imagemUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagemUrl} alt={texto('title', '')} className="aspect-[4/3] w-full rounded-lg object-cover md:order-1" />
          )}
        </section>
      )
    }

    case 'productCollection': {
      const produtos = resolveProductSection(vitrine.produtos, block.props)
      return (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold">{texto('title', 'Produtos em destaque')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {produtos.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                    {product.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imagemUrl} alt={product.nome} className="size-full object-cover" />
                    ) : null}
                  </div>
                  <p className="font-medium">{product.nome}</p>
                  <p className="text-sm text-muted-foreground">{product.precoFormatado}</p>
                  {onAdd && <Button variant="outline" size="sm" onClick={() => onAdd(product)}>Adicionar</Button>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )
    }

    case 'categoryCollection': {
      const limite = typeof block.props.limit === 'number' ? Math.max(1, block.props.limit) : 6
      return (
        <section className="flex flex-col items-center gap-4 text-center">
          <h2 className="font-heading text-2xl font-semibold">{texto('title', 'Explore por categoria')}</h2>
          <div className="flex flex-wrap justify-center gap-2" aria-label="Categorias">
            {vitrine.categorias.slice(0, limite).map((category) => (
              <Button key={category.id} variant="outline">{category.nome}</Button>
            ))}
          </div>
        </section>
      )
    }

    case 'banner':
    case 'cta':
      return (
        <section className="rounded-2xl bg-(--vitrine-primary) px-6 py-10 text-center text-primary-foreground">
          <h2 className="font-heading text-2xl font-semibold">{texto('title', 'Fale com a nossa marca')}</h2>
          <p className="mt-2 opacity-85">{texto('description', 'Estamos prontos para ajudar você.')}</p>
          {block.props.action && (
            <a href={vitrine.whatsappLink} target="_blank" rel="noreferrer" className="mt-4 inline-block">
              <Button variant="secondary" size="lg"><MessageCircle data-icon="inline-start" />{texto('action', 'Chamar no WhatsApp')}</Button>
            </a>
          )}
        </section>
      )

    case 'testimonials': {
      const items = Array.isArray(block.props.items) ? (block.props.items as Array<{ nome?: unknown; texto?: unknown }>) : []
      return (
        <section className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-heading text-2xl font-semibold">{texto('title', 'O que dizem nossos clientes')}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.filter((item) => item.texto).map((item, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col gap-2 p-4">
                  <p className="text-muted-foreground leading-relaxed">“{String(item.texto)}”</p>
                  <p className="text-sm font-medium">{String(item.nome ?? '')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )
    }

    case 'faq': {
      const items = Array.isArray(block.props.items) ? (block.props.items as Array<{ pergunta?: unknown; resposta?: unknown }>) : []
      return (
        <section className="mx-auto max-w-2xl py-4">
          <h2 className="mb-4 text-center font-heading text-2xl font-semibold">{texto('title', 'Perguntas frequentes')}</h2>
          <div className="flex flex-col gap-3">
            {items.filter((item) => item.pergunta).map((item, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <p className="font-medium">{String(item.pergunta)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{String(item.resposta ?? '')}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )
    }

    case 'gallery': {
      const images = Array.isArray(block.props.images) ? block.props.images.filter((url): url is string => typeof url === "string") : []
      return (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-2xl font-semibold">{texto('title', 'Galeria')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        </section>
      )
    }

    case 'divider':
      return <hr className="border-border" />

    case 'spacer':
      return <div className="h-8" aria-hidden="true" style={typeof block.props.height === 'number' ? { height: block.props.height } : undefined} />

    default:
      return null
  }
}
```

> Nota: `resolveProductSection` retorna itens com `imagemUrl`? Ela recebe `products` tipados sem `imagemUrl` na assinatura atual — o renderer usa `.imagemUrl` de `VitrineView['produtos']`. Ajustar a assinatura de `resolveProductSection` (Task B) para incluir `imagemUrl?: string | null` no tipo do produto. (Correção pequena aplicada no Step 2 desta Task.)

- [ ] **Step 2: Ampliar tipo de produto em `resolveProductSection` (Task B)** — adicionar `imagemUrl?: string | null` e `precoFormatado?: string` ao parâmetro `products` para o renderer poder usá-los (o objeto retornado preserva as props originais).

- [ ] **Step 3: Rodar typecheck/lint** — `npm run typecheck && npm run lint`
  Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/vitrine/experience-renderer.tsx src/lib/experience.ts
git commit -m "feat: renderiza as 13 block types e flag de preview"
```

---

### Task D: Storefront — abas de páginas-camadas

**Files:**
- Modify: `src/components/features/vitrine/storefront.tsx`

**Interfaces consumed:** `VitrineView.paginas` (Task A), `Tabs` do `ui/` (já instalado).
**Interfaces produced:** `Storefront({ vitrine, preview? })` — ganha prop `preview?: boolean`.

- [ ] **Step 1: Reescrever corpo do `Storefront`**

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { ShoppingBag, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { VitrineView } from '@/lib/vitrine-view'
import { obterFonte } from '@/lib/visual'

import { ExperienceRenderer } from './experience-renderer'
import { OrderSheet } from './order-sheet'

type ItemCarrinho = {
  id: string
  nome: string
  precoCents: number
  precoFormatado: string
  quantidade: number
}

export function Storefront({ vitrine, preview = false }: { vitrine: VitrineView; preview?: boolean }) {
  const [carrinho, setCarrinho] = useState<Record<string, ItemCarrinho>>({})
  const [sheetAberto, setSheetAberto] = useState(false)
  const [paginaId, setPaginaId] = useState(vitrine.paginas[0]?.id ?? '')

  const cssFonte = obterFonte(vitrine.tema.fonte).css
  const paginaAtiva = vitrine.paginas.find((p) => p.id === paginaId) ?? vitrine.paginas[0]

  useEffect(() => {
    const raiz = document.documentElement
    raiz.style.setProperty('--vitrine-primary', vitrine.tema.corPrimaria)
    raiz.style.setProperty('--vitrine-secondary', vitrine.tema.corSecundaria)
    raiz.style.setProperty('--vitrine-bg', vitrine.tema.corFundo)
    return () => {
      raiz.style.removeProperty('--vitrine-primary')
      raiz.style.removeProperty('--vitrine-secondary')
      raiz.style.removeProperty('--vitrine-bg')
    }
  }, [vitrine.tema])

  const itensCarrinho = useMemo(() => Object.values(carrinho), [carrinho])
  const totalItens = useMemo(() => itensCarrinho.reduce((soma, item) => soma + item.quantidade, 0), [itensCarrinho])

  function adicionar(produto: VitrineView['produtos'][number]) {
    setCarrinho((anterior) => {
      const atual = anterior[produto.id]
      return { ...anterior, [produto.id]: { id: produto.id, nome: produto.nome, precoCents: produto.precoCents, precoFormatado: produto.precoFormatado, quantidade: (atual?.quantidade ?? 0) + 1 } }
    })
  }

  function alterarQuantidade(id: string, quantidade: number) {
    setCarrinho((anterior) => {
      const atual = anterior[id]
      if (!atual) return anterior
      if (quantidade <= 0) { const copia = { ...anterior }; delete copia[id]; return copia }
      return { ...anterior, [id]: { ...atual, quantidade } }
    })
  }

  return (
    <div className="min-h-svh bg-(--vitrine-bg)" style={{ fontFamily: cssFonte }}>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-(--vitrine-bg)/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            {vitrine.tema.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={vitrine.tema.logoUrl} alt={`Logo de ${vitrine.nome}`} className="size-8 rounded-full object-cover" />
            ) : (
              <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-(--vitrine-primary) text-white">
                <Store className="size-4" aria-hidden="true" />
              </div>
            )}
            <span className="truncate font-heading font-semibold tracking-tight">{vitrine.nome}</span>
          </div>
          {!preview && (
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="ghost" size="sm" className="relative" onClick={() => setSheetAberto(true)}>
                <ShoppingBag aria-hidden="true" />Pedido
                {totalItens > 0 && <Badge className="absolute -top-1.5 -right-1.5 size-4 p-0 text-[10px] tabular-nums">{totalItens}</Badge>}
              </Button>
            </div>
          )}
        </div>
      </header>

      {vitrine.paginas.length > 1 && (
        <div className="sticky top-14 z-30 border-b border-border/60 bg-(--vitrine-bg)/90 backdrop-blur-md">
          <Tabs value={paginaId} onValueChange={setPaginaId} className="mx-auto max-w-5xl px-4 sm:px-6">
            <TabsList variant="line" className="h-10 w-full">
              {vitrine.paginas.map((pagina) => (
                <TabsTrigger key={pagina.id} value={pagina.id}>{pagina.rotulo}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        {paginaAtiva ? (
          <ExperienceRenderer blocks={paginaAtiva.blocos} vitrine={vitrine} onAdd={preview ? undefined : adicionar} preview={preview} />
        ) : null}
      </main>

      {!preview && (
        <OrderSheet vitrine={vitrine} itens={itensCarrinho} aberto={sheetAberto} onOpenChange={setSheetAberto} onAlterarQuantidade={alterarQuantidade} onLimpar={() => setCarrinho({})} />
      )}
    </div>
  )
}
```

> Base UI `Tabs` usa `value`/`onValueChange` (sem `defaultValue` necessário). Se `value` vazio (0 páginas) — os botões de página não renderizam (só com `length > 1`).

- [ ] **Step 2: Rodar typecheck/lint** — `npm run typecheck && npm run lint`
  Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/vitrine/storefront.tsx
git commit -m "feat: abas de páginas-camadas na vitrine pública"
```

---

### Task E: Tema — action, `TemaForm` carregando persistido, abas da página

**Files:**
- Create: `src/app/actions/tema.ts`
- Modify: `src/components/features/aparencia/tema-form.tsx`
- Modify: `src/app/dashboard/aparencia/page.tsx`

**Interfaces consumed:** `requireMinhaLoja`, `TemaView` (tipo já existente em `tema-form.tsx`).
**Interfaces produced:** `carregarTemaAction(): Promise<{ ok: true; tema: TemaView } | { ok: false; error: string }>`.

- [ ] **Step 1: Criar `src/app/actions/tema.ts`**

```ts
"use server"

import { requireMinhaLoja } from "@/lib/loja"

export type TemaView = {
  paleta: string
  estilo: string
  formatoCard: string
  layout: string
  fonte: "SANS" | "MANROPE" | "SERIF" | "DISPLAY" | "MONO"
  logoUrl: string | null
}

export type CarregarTemaResultado =
  | { ok: true; tema: TemaView }
  | { ok: false; error: string }

export async function carregarTemaAction(): Promise<CarregarTemaResultado> {
  try {
    const loja = await requireMinhaLoja()
    const tema = loja.getTema()
    return {
      ok: true,
      tema: {
        paleta: tema.getPaleta(),
        estilo: tema.getEstilo(),
        formatoCard: tema.getFormatoCard(),
        layout: tema.getLayout(),
        fonte: tema.getFonte(),
        logoUrl: tema.getLogoUrl()?.getValue() ?? null,
      },
    }
  } catch (erro) {
    return { ok: false, error: erro instanceof Error ? erro.message : "Erro ao carregar o tema." }
  }
}
```

- [ ] **Step 2: Atualizar `tema-form.tsx`** — a prop `tema` vira opcional `{ tema?: TemaView }`; adicionar `useEffect` que chama `carregarTemaAction` (espelho do builder: `useState<TemaView | null>` + `isLoading`), e `defaultValues` vêm do tema carregado; mostrar um `Skeleton` enquanto carrega; manter o resto do form igual.

- [ ] **Step 3: Atualizar `aparencia/page.tsx`** para abas

```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExperienceBuilder } from '@/components/features/aparencia/experience-builder'
import { TemaForm } from '@/components/features/aparencia/tema-form'
import { PageHeader, PageHeaderContent, PageHeaderDescription, PageHeaderTitle } from '@/components/layout/page-header'

export default function AparenciaPage() {
  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Construtor da vitrine</PageHeaderTitle>
          <PageHeaderDescription>
            Crie páginas completas com blocos de conteúdo, coleções e histórias da sua marca.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <Tabs defaultValue="construtor">
        <TabsList>
          <TabsTrigger value="construtor">Construtor</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
        </TabsList>
        <TabsContent value="construtor">
          <ExperienceBuilder />
        </TabsContent>
        <TabsContent value="aparencia">
          <TemaForm />
        </TabsContent>
      </Tabs>
    </>
  )
}
```

- [ ] **Step 4: Rodar typecheck/lint** — `npm run typecheck && npm run lint`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/actions/tema.ts src/components/features/aparencia/tema-form.tsx src/app/dashboard/aparencia/page.tsx
git commit -m "feat: reinclui editor de tema como aba e carrega tema persistido"
```

---

### Task F: `block-form.tsx` — formulário de conteúdo por tipo de bloco

**Files:**
- Create: `src/components/features/aparencia/block-form.tsx`

**Interfaces consumed:** `BlocoExperiencia`, `PaginaExperiencia`, `propSchemas` (Task A/B), primitives `ui/`, `UploadImagem`, `VitrineBase` (via props).
**Interfaces produced:** `BlockForm({ bloco, onChange, produtos, categorias })`.

- [ ] **Step 1: Criar `block-form.tsx`**

```tsx
'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { UploadImagem } from '@/components/patterns/upload-imagem'
import { propSchemas, type BlocoExperiencia, type BlockType } from '@/lib/experience'

type ItemArray = {
  label: string
  campos: { chave: string; placeholder: string; area?: boolean }[]
  chave: 'items' | 'images'
  itemInicial: Record<string, unknown>
}

function itensPara(tipo: BlockType): ItemArray | null {
  if (tipo === 'testimonials') return { label: 'Depoimentos', chave: 'items', campos: [{ chave: 'nome', placeholder: 'Nome do cliente' }, { chave: 'texto', placeholder: 'Depoimento', area: true }], itemInicial: { nome: '', texto: '' } }
  if (tipo === 'faq') return { label: 'Perguntas', chave: 'items', campos: [{ chave: 'pergunta', placeholder: 'Pergunta', area: true }, { chave: 'resposta', placeholder: 'Resposta' }], itemInicial: { pergunta: '', resposta: '' } }
  if (tipo === 'gallery') return { label: 'Imagens', chave: 'images', campos: [{ chave: 'url', placeholder: 'URL da imagem' }], itemInicial: { url: '' } }
  return null
}

export function BlockForm({
  bloco,
  onChange,
  produtos,
  categorias,
}: {
  bloco: BlocoExperiencia
  onChange: (props: Record<string, unknown>) => void
  produtos: { id: string; nome: string }[]
  categorias: { id: string; nome: string }[]
}) {
  const schema = propSchemas[bloco.type]
  const itemLista = itensPara(bloco.type)

  const form = useForm({
    resolver: zodResolver(schema as never),
    defaultValues: bloco.props as Record<string, unknown>,
    mode: 'onChange',
  })

  const valores = form.watch()
  const valid = form.formState.isValid

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        {/* Campo nome do bloco (label) sempre visível */}
        <Field>
          <FieldLabel>Nome do bloco</FieldLabel>
          <Controller
            name="label"
            control={form.control}
            render={({ field }) => (
              <Input
                value={field.value}
                onChange={(e) => onChange({ ...valores, label: e.target.value })}
                onBlur={(e) => onChange({ ...form.getValues(), label: e.target.value })}
                placeholder="Nome exibido no construtor"
              />
            )}
          />
        </Field>
        {campos(bloco.type, form, onChange, produtos, categorias)}
      </FieldGroup>

      {itemLista && (
        <ItemListEditor
          bloco={bloco}
          itemLista={itemLista}
          form={form}
          onChange={onChange}
        />
      )}

      {!valid && (
        <FieldError>
          Revise os campos: há valores inválidos.
        </FieldError>
      )}
    </div>
  )
}
```

> O "label" está separado dos `props` — o campo real é `bloco.label`. Para simplificar, o `BlockForm` monta um `defaultValues` com `{ label: bloco.label, ...bloco.props }` e o schema de props é só para `props`. A implementação final recomenda: o `Controller` acima lê/escreve diretamente em `bloco.label` via `onChange` do componente pai, e os demais campos (via `campos`) escrevem em `props`. Guarde `label` fora do schema: `BlockForm` recebe `onLabelChange(title: string)` para não misturar.

**Ajuste obrigatório da assinatura:** `BlockForm({ bloco, onChange, onLabelChange, produtos, categorias })` — `onLabelChange: (label: string) => void`.

- [ ] **Step 2: Implementar helper `campos` + `ItemListEditor` (mesmo arquivo)**

```tsx
function campos(
  tipo: BlockType,
  form: ReturnType<typeof useForm>,
  onChange: (props: Record<string, unknown>) => void,
  produtos: { id: string; nome: string }[],
  categorias: { id: string; nome: string }[]
) {
  // Campos por tipo: Defina aqui um render por chave de props, usando Controller.
  // Referência (texto): nome <key> → <Input>; longText → <Textarea>; bool → <Switch>;
  // select-unico → <Select>; multi-produtos → <Select multiple>; imagem → <UploadImagem>.
  // Chaves por tipo (alinhadas a propSchemas):
  // hero: title(text), description(textarea), action(text), buttonVisible(bool)
  // richText: title(text), align(select left|center), body(textarea)
  // imageText: title(text), body(textarea), imageSide(select left|right), imageUrl(image)
  // productCollection: title(text), categoryId(select categorias|null), order(select), mode(select), manualIds(multi-produtos), limit(number)
  // categoryCollection: title(text), limit(number)
  // about: title(text), body(textarea)
  // banner: title(text), description(textarea), action(text)
  // cta: title(text), description(textarea), action(text)
  // testimonials/faq/gallery: title(text) + itens via ItemListEditor
  // spacer: height(number)
  // divider: sem campos além do label
}
```

> Esta Task é a mais extensa: cada chave vira um `Controller` + `Field` (ver `tema-form.tsx` como referência de estilo). Padronização: `text`, `textarea`, `number`, `bool`, `select`, `multi-produtos`, `image`. O executor deve implementar os cases de `campos` seguindo a tabela acima e usa `Controller` para cada um, chamando `onChange({ ...form.getValues().props, [chave]: próximoValor })`. Para isso, mantemos o form com SEPARACAO: campo `label` fora do schema; `form` só controla os `props`. Implementação recomendada:

- `useForm<Record<string, unknown>>` cujo `defaultValues` são `bloco.props` e NÃO usamos `watch` global — cada `Controller` edita sua chave e propaga `onChange` no `onBlur`/`onChange`.
- `isValid` via `schema.safeParse(valores)` (memorizado com `useMemo`).

**Isso é o coração do formulário — no código final, garanta:**
1. Cada campo chama `onChange({ ...bloco.props, [chave]: valor })`.
2. `manualIds` usa `Select` com `multiple` marcando produtos; `categoryId` usa `Select` com item "Todas as categorias" (value `null`).
3. `ItemListEditor` edita arrays (`items` de testimonials/faq, `images` de gallery) com `add`/`remove`/edição inline, propagando `onChange` do array inteiro.

- [ ] **Step 3: Rodar typecheck** — `npm run typecheck`
  Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/features/aparencia/block-form.tsx
git commit -m "feat: formulário de conteúdo por tipo de bloco"
```

---

### Task G: `preview-vitrine.tsx` — preview ao vivo real

**Files:**
- Create: `src/components/features/aparencia/preview-vitrine.tsx`

**Interfaces consumed:** `Storefront` (Task D), `VitrineBase`/`VitrineView` (Task A), `PaginaExperiencia` (Task B), `Sheet` do `ui/`.
**Interfaces produced:** `PreviewVitrine({ base, paginas, aberto, onAbrirChange })`.

- [ ] **Step 1: Criar `preview-vitrine.tsx`**

```tsx
'use client'

import { useDeferredValue, useState } from 'react'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Empty, EmptyContent, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { Storefront } from '@/components/features/vitrine/storefront'
import type { VitrineBase, VitrineView } from '@/lib/vitrine-view'
import type { PaginaExperiencia } from '@/lib/experience'

const LARGURAS = {
  mobile: 'max-w-[390px]',
  tablet: 'max-w-[768px]',
  desktop: 'max-w-full',
} as const

export function PreviewVitrine({
  base,
  paginas,
  aberto,
  onAbrirChange,
}: {
  base: VitrineBase
  paginas: PaginaExperiencia[]
  aberto: boolean
  onAbrirChange: (aberto: boolean) => void
}) {
  const [device, setDevice] = useState<keyof typeof LARGURAS>('mobile')
  const paginasDeferidas = useDeferredValue(paginas)

  const vitrine: VitrineView = { ...base, paginas: paginasDeferidas }

  const PreviewInterno = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b p-2">
        <span className="text-sm font-medium">Preview ao vivo</span>
        <div className="flex gap-1">
          {Object.keys(LARGURAS).map((d) => (
            <Button key={d} variant={device === d ? 'default' : 'outline'} size="sm" onClick={() => setDevice(d as keyof typeof LARGURAS)}>{d}</Button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-y-auto bg-muted/40 p-2">
        <div className={`w-full ${LARGURAS[device]} overflow-hidden rounded-xl ring-1 ring-border`}>
          <Storefront vitrine={vitrine} preview />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden min-w-0 flex-1 lg:block">
        {paginas.length === 0 ? (
          <Empty>
            <EmptyTitle>Nenhuma página ainda</EmptyTitle>
            <EmptyDescription>Adicione uma camada para ver a prévia.</EmptyDescription>
          </Empty>
        ) : (
          PreviewInterno
        )}
      </div>
      <button
        type="button"
        className="lg:hidden"
        onClick={() => onAbrirChange(true)}
        aria-label="Abrir preview"
      >
        <Button variant="outline" size="sm"><Eye data-icon="inline-start" />Preview</Button>
      </button>
      <Sheet open={aberto} onOpenChange={onAbrirChange}>
        <SheetContent side="full" className="p-0">
          <SheetTitle className="sr-only">Preview da vitrine</SheetTitle>
          {PreviewInterno}
        </SheetContent>
      </Sheet>
    </>
  )
}
```

> Ajustes finais: botão mobile deve usar `Button`; `SheetTitle` obrigatório (a11y). Verificar variantes do `Sheet` do `ui/` (`side`, `SheetContent`). Em preview o `Storefront` passa `preview` (esconde o carrinho e desabilita "Adicionar" via `onAdd={undefined}`).

- [ ] **Step 2: Rodar typecheck/lint** — `npm run typecheck && npm run lint`
  Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/aparencia/preview-vitrine.tsx
git commit -m "feat: preview ao vivo da vitrine no construtor"
```

---

### Task H: Rework do `ExperienceBuilder` — camadas + forms + preview

**Files:**
- Rewrite: `src/components/features/aparencia/experience-builder.tsx`

**Interfaces consumed:** `carregarExperienciaAction`, `salvarExperienciaAction`, `carregarBasePreviewAction` (Task A); `initialPages`, `templates`, `moveBlock`, `duplicateBlock`, `createBlock`, `blockTypeLabel`, `blockCatalog`, `planCapabilities`, `PaginaExperiencia`, `BlocoExperiencia` (Task B); `BlockForm` (Task F); `PreviewVitrine` (Task G).

- [ ] **Step 1: Reescrever `experience-builder.tsx` (estado)**

```tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Layers3, Lock, Plus, Trash2 } from 'lucide-react'

import { carregarBasePreviewAction, carregarExperienciaAction, salvarExperienciaAction } from '@/app/actions/experiencia'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { blockCatalog, blockTypeLabel, createBlock, duplicateBlock, initialPages, moveBlock, planCapabilities, templates, type BlockType, type PaginaExperiencia, type BlocoExperiencia } from '@/lib/experience'
import type { VitrineBase } from '@/lib/vitrine-view'

import { BlockForm } from './block-form'
import { PreviewVitrine } from './preview-vitrine'
```

- [ ] **Step 2: Implementar corpo (estado, load, mutações, salvar, render)**

```tsx
export function ExperienceBuilder({ plan = 'LIVRE' }: { plan?: StorePlan }) {
  const router = useRouter()
  const capabilities = planCapabilities[plan]

  const [paginas, setPaginas] = useState<PaginaExperiencia[]>(initialPages)
  const [paginaId, setPaginaId] = useState(initialPages[0].id)
  const [base, setBase] = useState<VitrineBase | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewAberto, setPreviewAberto] = useState(false)
  const [renomeandoId, setRenomeandoId] = useState<string | null>(null)
  const [adicionandoTemplate, setAdicionandoTemplate] = useState(false)

  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const selectedId = paginaAtiva?.blocos[0]?.id ?? ''
  const selected = paginaAtiva?.blocos.find((b) => b.id === selectedId)
  const grouped = useMemo(() => ({ essential: blockCatalog.filter((b) => b.plan === 'ESSENCIAL'), advanced: blockCatalog.filter((b) => b.plan === 'LIVRE') }), [])

  useEffect(() => {
    let ativo = true
    Promise.all([carregarExperienciaAction(), carregarBasePreviewAction()])
      .then(([r1, r2]) => {
        if (!ativo) return
        if (r1.ok) {
          setPaginas(r1.paginas.length > 0 ? r1.paginas : initialPages)
          setPaginaId(r1.paginas[0]?.id ?? initialPages[0].id)
        }
        if (r2.ok) setBase(r2.base)
      })
      .finally(() => { if (ativo) setIsLoading(false) })
    return () => { ativo = false }
  }, [])

  function atualizarPagina(atualiza: (pagina: PaginaExperiencia) => PaginaExperiencia) {
    setPaginas((atuais) => atuais.map((p) => (p.id === paginaId ? atualiza(p) : p)))
  }

  function mudarBloco(id: string, props: Record<string, unknown>) {
    atualizarPagina((p) => ({ ...p, blocos: p.blocos.map((b) => (b.id === id ? { ...b, props } : b)) }))
  }

  function mudarLabel(id: string, label: string) {
    atualizarPagina((p) => ({ ...p, blocos: p.blocos.map((b) => (b.id === id ? { ...b, label } : b)) }))
  }

  function adicionar(tipo: BlockType) {
    atualizarPagina((p) => {
      if (p.blocos.length >= capabilities.maxBlocks) return p
      const bloco = createBlock(tipo)
      return { ...p, blocos: [...p.blocos, bloco] }
    })
  }

  function adicionarPagina(template: (typeof templates)[number]) {
    setPaginas((atuais) => {
      if (atuais.length >= capabilities.maxPages) return atuais
      const pagina = template.paginas[0]
      return [...atuais, { ...pagina, id: `pagina-${Date.now()}`, ordem: atuais.length }]
    })
    setAdicionandoTemplate(false)
  }

  function removerPagina(id: string) {
    setPaginas((atuais) => {
      if (atuais.length <= 1) return atuais
      const rest = atuais.filter((p) => p.id !== id)
      setPaginaId(rest[0].id)
      return rest
    })
  }

  async function publicar() {
    setIsSaving(true)
    setError(null)
    try {
      const resultado = await salvarExperienciaAction(paginas)
      if (!resultado.ok) { setError(resultado.error); return }
      toast.add({ title: 'Vitrine publicada', description: 'Suas páginas foram atualizadas.', type: 'success' })
      router.refresh()
    } finally { setIsSaving(false) }
  }
```

- [ ] **Step 3: Implementar render (JSX)** — manter o layout atual e: (a) trocar o badge por `Tabs`/chips de páginas com ações renomear/remover; (b) painel `Propriedades` passa a usar `<BlockForm key={selected.id} bloco={selected} produtos={base?.produtos ?? []} categorias={base?.categorias ?? []} onChange={(props) => mudarBloco(selected.id, props)} onLabelChange={(label) => mudarLabel(selected.id, label)} />`; (c) grid vira `lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]` com `<PreviewVitrine base={base ?? fallbackBásico} paginas={paginas} aberto={previewAberto} onAbrirChange={setPreviewAberto} />` à direita; (d) botão "Publicar" persiste `paginas`; (e) dialog de adicionar página usa `templates()`; (f) `fallbackBásico` = `{ nome: paginas[0]?.rotulo ?? 'Minha loja', slug: '', descricao: '', whatsapp: '', whatsappLink: '', tema: { paleta: 'OCEANO', estilo: 'CLASSICO', formatoCard: 'QUADRADO', layout: 'GRADE_DENSA', fonte: 'SANS', logoUrl: null, corPrimaria: '#2563EB', corSecundaria: '#F59E0B', corFundo: '#FFFFFF' }, categorias: [], produtos: [] }` [(definido como constante `VITRINE_BASE_PADRAO` no topo do arquivo — enquanto `base` não carrega, a preview usa fallback)].

> Detalhe crítico: `selected` pode ser `undefined` quando a página ativa está vazia — nesse caso o painel Propriedades mostra empty state; `BlockForm` só monta com `selected` definido (`key={selected.id}`).

- [ ] **Step 4: Rodar verificação** — `npm run typecheck && npm run lint && npm run test`
  Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/aparencia/experience-builder.tsx
git commit -m "feat: construtor com páginas-camadas, forms de blocos e preview ao vivo"
```

---

### Task I: Verificação final e revisão de qualidade

- [ ] **Step 1: Rodar `npm run typecheck && npm run lint && npm run test`** — Expected: PASS, zero erros.
- [ ] **Step 2: Revisar diffs** contra a spec (docs/superpowers/specs/...):
  - 13 block types renderizados (`ExperienceRenderer`).
  - `resolveProductSection` honrando `mode` e `order`.
  - Preview ao vivo reage ao rascunho (mesmo `Storefront`).
  - Abas na vitrine pública (`Storefront`) e chips no construtor.
  - `TemaForm` como aba + `carregarTemaAction`.
  - Sem miscelânea: sem dead code (`getBlocos`/`deBlocos` removidos; `pageTemplates` → `templates`).
- [ ] **Step 3: Rodar `npm run build`** — Expected: PASS (Next compila).
- [ ] **Step 4: Commit final** (se houver ajustes) e encerrar.

---

## Self-Review (planejado antes do handoff)

- **Cobertura da spec:** Task A (domínio v2, comando, actions, vitrine-view) · B (initialPages/templates/resolveProductSection) · C (13 types + preview) · D (abas público) · E (tema aba) · F (block-form) · G (preview) · H (builder camadas) · I (verificação). Não-goals respeitados (sem plano, sem migração, sem estilos por bloco).
- **Placeholders:** os Steps F/2 descrevem casos a implementar na tabela, mas o executor precisa do código — a Task F exige que o código siga o padrão `tema-form.tsx` (Controller + Field) e a tabela de chaves por tipo; é o risco da face UI. Mitigação: `block-form` reusa `propSchemas` e `tema-form` como referência concreta.
- **Consistência de tipos:** `PaginaExperiencia`, `propSchemas`, `carregar*Resultado` e assinaturas de `Storefront`/`ExperienceRenderer`/`BlockForm`/`PreviewVitrine` são fixadas nas Interfaces das Tasks e reutilizadas em todas as dependentes.