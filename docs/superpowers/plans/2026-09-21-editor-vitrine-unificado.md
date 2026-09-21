# Editor da Vitrine Unificado — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar a spec `docs/superpowers/specs/2026-09-21-editor-vitrine-unificado-spec.md`: editor único (Conteúdo + Aparência) com prévia real persistente, inspector adaptativo, presets + modo avançado, salvar por modo com indicador de pendências, prefetch no servidor e gravação focada sem N+1.

**Architecture:** `aparencia/page.tsx` vira server component que prefetcha `paginas`/`base`/`tema` e entrega a um shell client (`vitrine-editor`) que detém o rascunho e a sujeira. A prévia é um único `PreviewPanel` persistente que reusa o `Storefront` real (memoizado + `useDeferredValue`). A aparência usa presets por padrão e grupos de ajuste fino sob toggle. A gravação de experiência e tema ganha caminhos focados no repositório (sem re-sincronizar produtos/categorias), mantendo o lock otimista.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `@base-ui/react`, Vitest (environment `node`, sem Testing Library), npm.

**Spec:** `docs/superpowers/specs/2026-09-21-editor-vitrine-unificado-spec.md`

## Global Constraints

- npm (nunca pnpm). Verificação: `npm run typecheck && npm run lint && npm test`.
- Tailwind v4 com tokens semânticos — nunca `bg-[#...]`/`rounded-[...]`, nunca `space-x-*`/`space-y-*` (usar `flex` + `gap-*`); dimensões iguais com `size-*`.
- Ícones em botões via `data-icon="inline-start"/"inline-end"`, sem `className="size-*"` no ícone; loading com `Spinner` + `disabled`.
- Primitives `@base-ui/react` (não Radix); compor `src/components/ui/*` existentes (`Button`, `Card`, `Field`, `Empty`, `Sheet`, `Dialog`, `ToggleGroup`, `Switch`, `Spinner`, `Separator`, `Badge`, `Alert`, `Tabs`).
- Formulários: `FieldGroup`/`Field`/`FieldLabel`/`FieldError` + `Controller`.
- `<img>` raw é o padrão da vitrine, com `// eslint-disable-next-line @next/next/no-img-element`.
- Testes Vitest em ambiente `node`, `include: ["tests/**/*.test.ts"]`; aliases `@` → `src`, `@tests` → `tests`. Sem DOM/Testing Library.
- Commits no estilo do repo: prefixo conventional + descrição pt-BR.
- Não alterar `prisma/schema.prisma`, VOs nem contratos de página pública além do previsto.

---

### Task 1: Gravação focada de experiência e tema (RF-12)

**Files:**
- Modify: `src/modules/loja/domain/loja-repository.ts`
- Modify: `src/modules/loja/application/loja-service.ts`
- Modify: `src/modules/loja/infrastructure/prisma-loja-repository.ts`
- Modify: `tests/helpers/in-memory-loja-repository.ts`
- Test: `tests/unit/application/loja-service-focado.test.ts`

**Interfaces:**
- Consumes: `Loja`, `Experiencia`, `IdentidadeVisual`, `DadosDesatualizados`, `LojaRepository`.
- Produces (usados pela Task F, indiretamente via `LojaService.handle`):
  - `LojaRepository.atualizarExperiencia(loja: Loja): Promise<void>`
  - `LojaRepository.atualizarTema(loja: Loja): Promise<void>`
  - `LojaService.handle(SalvarExperiencia)` e `handle(AlterarTema)` passam a usar esses métodos (não chamam mais `repository.save`).

- [ ] **Step 1: Write the failing test**

Create `tests/unit/application/loja-service-focado.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import { LojaService } from "@/modules/loja/application/loja-service";
import { CriarLoja } from "@/modules/loja/application/commands/criar-loja";
import { AdicionarProduto } from "@/modules/loja/application/commands/adicionar-produto";
import { AlterarTema } from "@/modules/loja/application/commands/alterar-tema";
import { SalvarExperiencia } from "@/modules/loja/application/commands/salvar-experiencia";
import { DadosDesatualizados } from "@/modules/loja/domain/exceptions/dados-desatualizados";
import { InMemoryLojaRepository } from "@tests/helpers/in-memory-loja-repository";
import { FakeEventBus } from "@tests/helpers/fake-event-bus";
import { LojistaId } from "@/kernel/ids/lojista-id";

const PAGINAS = [
  {
    id: "home-1",
    rotulo: "Home",
    ordem: 0,
    blocos: [
      {
        id: "hero-1",
        type: "hero" as const,
        label: "Hero",
        visible: true,
        props: { title: "Cafés especiais" },
      },
    ],
  },
];

describe("LojaService — gravação focada", () => {
  let repository: InMemoryLojaRepository;
  let eventBus: FakeEventBus;
  let service: LojaService;

  beforeEach(() => {
    repository = new InMemoryLojaRepository();
    eventBus = new FakeEventBus();
    service = new LojaService(repository, eventBus);
  });

  async function criarComProduto() {
    const lojaId = await service.handle(
      CriarLoja.from({ lojistaId: LojistaId.random().toUUID(), nome: "Café", whatsapp: "41999998888" })
    );
    await service.handle(
      AdicionarProduto.from({ lojaId: lojaId.toUUID(), nome: "Bolo", precoCents: 1500 })
    );
    return lojaId;
  }

  it("salvar experiência preserva produtos/categorias intactos", async () => {
    const lojaId = await criarComProduto();

    await service.handle(SalvarExperiencia.from({ lojaId: lojaId.toUUID(), paginas: PAGINAS }));

    const loja = await repository.findById(lojaId);
    expect(loja?.getExperiencia().getPaginas()).toHaveLength(1);
    expect(loja?.getProdutos()).toHaveLength(1);
    expect(loja?.getProdutos()[0].getNome().getValue()).toBe("Bolo");
  });

  it("salvar tema preserva produtos intactos", async () => {
    const lojaId = await criarComProduto();

    await service.handle(
      AlterarTema.from({
        lojaId: lojaId.toUUID(),
        paleta: "BLUSH",
        estilo: "MODERNO",
        formatoCard: "RETRATO",
        layout: "LISTA",
        fonte: "SANS",
      })
    );

    const loja = await repository.findById(lojaId);
    expect(loja?.getTema().getPaleta()).toBe("BLUSH");
    expect(loja?.getProdutos()).toHaveLength(1);
  });

  it("propaga conflito de versão como DadosDesatualizados", async () => {
    const lojaId = await criarComProduto();

    class RepoConflito extends InMemoryLojaRepository {
      override async atualizarExperiencia(): Promise<void> {
        throw new DadosDesatualizados("loja");
      }
    }
    const serviceConflito = new LojaService(new RepoConflito(repository), eventBus);

    await expect(
      serviceConflito.handle(SalvarExperiencia.from({ lojaId: lojaId.toUUID(), paginas: PAGINAS }))
    ).rejects.toBeInstanceOf(DadosDesatualizados);
  });
});
```

Nota: `InMemoryLojaRepository` precisa expor os dados para o `RepoConflito`; o helper abaixo copia o mapa via um construtor opcional.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/unit/application/loja-service-focado.test.ts`
Expected: FAIL — `atualizarExperiencia` não existe em `LojaRepository` (erro de tipo) e/ou `RepoConflito` não compila.

- [ ] **Step 3: Add the repository contract**

Em `src/modules/loja/domain/loja-repository.ts`, adicionar após `save`:

```ts
  /** Atualiza apenas a experiência (JSON) com lock otimista na coluna versao. */
  atualizarExperiencia(loja: Loja): Promise<void>;

  /** Atualiza apenas as colunas de tema com lock otimista na coluna versao. */
  atualizarTema(loja: Loja): Promise<void>;
```

- [ ] **Step 4: Implement in-memory**

Substituir `tests/helpers/in-memory-loja-repository.ts` por:

```ts
import type { LojaId } from "@/kernel/ids/loja-id";
import type { LojistaId } from "@/kernel/ids/lojista-id";
import type { LojaRepository } from "@/modules/loja/domain/loja-repository";
import type { Loja } from "@/modules/loja/domain/loja";
import type { Slug } from "@/modules/loja/domain/vos/slug";
import { DadosDesatualizados } from "@/modules/loja/domain/exceptions/dados-desatualizados";

/**
 * Fake em memória do {@link LojaRepository} para testes de aplicação (sem banco).
 */
export class InMemoryLojaRepository implements LojaRepository {
  private readonly dados = new Map<string, Loja>();
  private readonly versoes = new Map<string, number>();

  /** Cópia defensiva para o fake de conflito de versão. */
  constructor(
    origem?: InMemoryLojaRepository | Map<string, Loja>,
    versoes?: Map<string, number>
  ) {
    const mapaLojas =
      origem instanceof InMemoryLojaRepository ? origem.obterMapa() : origem ?? new Map<string, Loja>();
    mapaLojas.forEach((loja, id) => this.dados.set(id, loja));
    if (versoes) versoes.forEach((v, id) => this.versoes.set(id, v));
  }

  /** Mapa interno (mesmas referências) para fakes derivados. */
  obterMapa(): Map<string, Loja> {
    return this.dados;
  }

  async save(loja: Loja): Promise<Loja> {
    const id = loja.getId().toUUID();
    this.dados.set(id, loja);
    this.versoes.set(id, loja.getVersion() ?? this.versoes.get(id) ?? 1);
    return loja;
  }

  private travarVersao(loja: Loja): void {
    const id = loja.getId().toUUID();
    const atual = this.versoes.get(id) ?? loja.getVersion() ?? 1;
    if (loja.getVersion() !== null && loja.getVersion() !== atual) {
      throw new DadosDesatualizados("loja");
    }
  }

  async atualizarExperiencia(loja: Loja): Promise<void> {
    this.travarVersao(loja);
    const id = loja.getId().toUUID();
    this.dados.set(id, loja);
    this.versoes.set(id, (this.versoes.get(id) ?? loja.getVersion() ?? 0) + 1);
    loja.bumpVersion();
  }

  async atualizarTema(loja: Loja): Promise<void> {
    this.travarVersao(loja);
    const id = loja.getId().toUUID();
    this.dados.set(id, loja);
    this.versoes.set(id, (this.versoes.get(id) ?? loja.getVersion() ?? 0) + 1);
    loja.bumpVersion();
  }

  async findById(id: LojaId): Promise<Loja | null> {
    return this.dados.get(id.toUUID()) ?? null;
  }

  async findBySlug(slug: Slug): Promise<Loja | null> {
    for (const loja of this.dados.values()) {
      if (loja.getSlug().equals(slug)) return loja;
    }
    return null;
  }

  async findByLojistaId(lojistaId: LojistaId): Promise<Loja | null> {
    for (const loja of this.dados.values()) {
      if (loja.getLojistaId().equals(lojistaId)) return loja;
    }
    return null;
  }

  async existsBySlug(slug: Slug): Promise<boolean> {
    for (const loja of this.dados.values()) {
      if (loja.getSlug().equals(slug)) return true;
    }
    return false;
  }

  get size(): number {
    return this.dados.size;
  }
}
```

No teste da Task 1, ajustar `new RepoConflito(repository)` — o construtor aceita a instância de origem.

- [ ] **Step 5: Implement in Prisma**

Em `src/modules/loja/infrastructure/prisma-loja-repository.ts`, adicionar após `save`:

```ts
  async atualizarExperiencia(loja: Loja): Promise<void> {
    try {
      const resultado = await this.prisma.loja.updateMany({
        where: { id: loja.getId().toUUID(), versao: loja.getVersion() ?? 1 },
        data: {
          experiencia: loja.getExperiencia().paraJson() as unknown as Prisma.InputJsonValue,
          versao: { increment: 1 },
        },
      });
      if (resultado.count !== 1) throw new DadosDesatualizados("loja");
      loja.bumpVersion();
    } catch (erro) {
      throw this.mapearErroDePersistencia(erro);
    }
  }

  async atualizarTema(loja: Loja): Promise<void> {
    const tema = loja.getTema();
    try {
      const resultado = await this.prisma.loja.updateMany({
        where: { id: loja.getId().toUUID(), versao: loja.getVersion() ?? 1 },
        data: {
          temaPaleta: tema.getPaleta(),
          temaEstilo: tema.getEstilo(),
          temaFormatoCard: tema.getFormatoCard(),
          temaLayout: tema.getLayout(),
          temaFonte: tema.getFonte(),
          temaLogoUrl: tema.getLogoUrl()?.getValue() ?? null,
          versao: { increment: 1 },
        },
      });
      if (resultado.count !== 1) throw new DadosDesatualizados("loja");
      loja.bumpVersion();
    } catch (erro) {
      throw this.mapearErroDePersistencia(erro);
    }
  }
```

- [ ] **Step 6: Use focused writes in the service**

Em `src/modules/loja/application/loja-service.ts`, substituir `alterarTema` e `salvarExperiencia` por:

```ts
  private async alterarTema(cmd: AlterarTema): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));

    const tema = IdentidadeVisual.of({
      paleta: cmd.paleta,
      estilo: cmd.estilo,
      formatoCard: cmd.formatoCard,
      layout: cmd.layout,
      fonte: cmd.fonte,
      logoUrl: cmd.logoUrl !== null ? Url.of(cmd.logoUrl!) : null,
    });

    const antes = loja.getTema();
    loja.alterarTema(tema);
    if (!loja.getTema().equals(antes)) {
      await this.repository.atualizarTema(loja);
    }
    await this.eventBus.publish(loja.pullDomainEvents());
  }

  private async salvarExperiencia(cmd: SalvarExperiencia): Promise<void> {
    const loja = await this.buscarPorId(LojaId.fromString(cmd.lojaId));
    const experiencia = Experiencia.dePaginas(cmd.paginas);

    const antes = loja.getExperiencia();
    loja.alterarExperiencia(experiencia);
    if (!loja.getExperiencia().equals(antes)) {
      await this.repository.atualizarExperiencia(loja);
    }
    await this.eventBus.publish(loja.pullDomainEvents());
  }
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm test -- tests/unit/application/loja-service-focado.test.ts && npm test`
Expected: PASS em todos os testes (suíte antiga permanece verde).

- [ ] **Step 8: Verify + commit**

Run: `npm run typecheck && npm run lint`
Expected: zero erros.

```bash
git add src/modules/loja tests/helpers tests/unit/application
git commit -m "feat(loja): gravação focada de experiência e tema (sem N+1)"
```

---

### Task 2: Lógica pura do editor (estado, dispositivos, presets)

**Files:**
- Create: `src/components/features/aparencia/editor-estado.ts`
- Create: `src/components/features/aparencia/preview-dispositivos.ts`
- Create: `src/components/features/aparencia/aparencia-presets.ts`
- Create: `src/components/features/aparencia/option-card.tsx`
- Test: `tests/unit/lib/editor-estado.test.ts`
- Test: `tests/unit/lib/aparencia-presets.test.ts`
- Test: `tests/unit/lib/preview-dispositivos.test.ts`

**Interfaces:**
- Consumes: `PaginaExperiencia` (`@/lib/experience`), `TemaView` (`@/app/actions/tema`), catálogos `@/lib/visual`.
- Produces (usados pelas Tasks C, D, E, F):
  - `type ModoEditor = "conteudo" | "aparencia"`
  - `type SujeiraEditor = { conteudo: boolean; aparencia: boolean }`
  - `sujeiraInicial(): SujeiraEditor`, `marcarSujo(s, modo): SujeiraEditor`, `limparSujo(s, modo): SujeiraEditor`, `temAlteracoes(s): boolean`
  - `DISPOSITIVOS`, `type DispositivoId`, `DISPOSITIVO_PADRAO`, `resolverDispositivo`, `resolverLargura`, `resolverOculta`, `LARGURA_MIN`, `LARGURA_MAX`
  - `type TemaSelecao`, `type PresetAparencia`, `PRESETS_APARENCIA`, `presetParaTema`, `encontrarPreset`
  - `OptionCard` (primitivo único de cartão selecionável)

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/lib/editor-estado.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  limparSujo,
  marcarSujo,
  sujeiraInicial,
  temAlteracoes,
} from "@/components/features/aparencia/editor-estado";

describe("sujeira do editor", () => {
  it("começa limpa", () => {
    expect(sujeiraInicial()).toEqual({ conteudo: false, aparencia: false });
    expect(temAlteracoes(sujeiraInicial())).toBe(false);
  });

  it("marca apenas o domínio informado", () => {
    const s = marcarSujo(sujeiraInicial(), "conteudo");
    expect(s).toEqual({ conteudo: true, aparencia: false });
    expect(temAlteracoes(s)).toBe(true);
  });

  it("limpar um domínio não afeta o outro", () => {
    const s = limparSujo(marcarSujo(marcarSujo(sujeiraInicial(), "conteudo"), "aparencia"), "conteudo");
    expect(s).toEqual({ conteudo: false, aparencia: true });
  });
});
```

Create `tests/unit/lib/aparencia-presets.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  PRESETS_APARENCIA,
  encontrarPreset,
  presetParaTema,
} from "@/components/features/aparencia/aparencia-presets";

describe("presets de aparência", () => {
  it("todo preset produz um tema completo e válido", () => {
    for (const preset of PRESETS_APARENCIA) {
      const tema = presetParaTema(preset);
      expect(tema.paleta).toBeTruthy();
      expect(tema.estilo).toBeTruthy();
      expect(tema.formatoCard).toBeTruthy();
      expect(tema.layout).toBeTruthy();
      expect(tema.fonte).toBeTruthy();
    }
  });

  it("encontra o preset que corresponde ao tema exato", () => {
    const preset = PRESETS_APARENCIA[0];
    expect(encontrarPreset(presetParaTema(preset))?.id).toBe(preset.id);
  });

  it("retorna null para tema personalizado", () => {
    const tema = { ...presetParaTema(PRESETS_APARENCIA[0]), paleta: "CARVAO" };
    expect(encontrarPreset(tema)).toBeNull();
  });
});
```

Create `tests/unit/lib/preview-dispositivos.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  DISPOSITIVO_PADRAO,
  LARGURA_MAX,
  LARGURA_MIN,
  resolverDispositivo,
  resolverLargura,
  resolverOculta,
} from "@/components/features/aparencia/preview-dispositivos";

describe("dispositivos da prévia", () => {
  it("resolve ids válidos e cai no padrão para inválidos", () => {
    expect(resolverDispositivo("tablet")).toBe("tablet");
    expect(resolverDispositivo("tv")).toBe(DISPOSITIVO_PADRAO);
    expect(resolverDispositivo(undefined)).toBe(DISPOSITIVO_PADRAO);
  });

  it("limita a largura à faixa permitida", () => {
    expect(resolverLargura(500)).toBe(500);
    expect(resolverLargura(10)).toBe(LARGURA_MIN);
    expect(resolverLargura(99999)).toBe(LARGURA_MAX);
    expect(resolverLargura("x")).toBeNull();
  });

  it("resolve oculta apenas para booleano true", () => {
    expect(resolverOculta(true)).toBe(true);
    expect(resolverOculta("true")).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- tests/unit/lib/editor-estado.test.ts tests/unit/lib/aparencia-presets.test.ts tests/unit/lib/preview-dispositivos.test.ts`
Expected: FAIL — módulos não existem.

- [ ] **Step 3: Implement `editor-estado.ts`**

```ts
import type { ModoEditor, SujeiraEditor } from './editor-tipos'

export function sujeiraInicial(): SujeiraEditor {
  return { conteudo: false, aparencia: false }
}

export function marcarSujo(sujeira: SujeiraEditor, modo: ModoEditor): SujeiraEditor {
  if (sujeira[modo]) return sujeira
  return { ...sujeira, [modo]: true }
}

export function limparSujo(sujeira: SujeiraEditor, modo: ModoEditor): SujeiraEditor {
  if (!sujeira[modo]) return sujeira
  return { ...sujeira, [modo]: false }
}

export function temAlteracoes(sujeira: SujeiraEditor): boolean {
  return sujeira.conteudo || sujeira.aparencia
}
```

Create `src/components/features/aparencia/editor-tipos.ts`:

```ts
/** Modos do editor unificado. */
export type ModoEditor = 'conteudo' | 'aparencia'

/** Sinalização de alterações não salvas por domínio. */
export type SujeiraEditor = Record<ModoEditor, boolean>
```

(Os testes importam de `editor-estado`, que reexporta os tipos: adicione
`export type { ModoEditor, SujeiraEditor } from './editor-tipos'` no topo de `editor-estado.ts`.)

- [ ] **Step 4: Implement `preview-dispositivos.ts`**

```ts
/** Presets de dispositivo da prévia (larguras centralizadas; RF-6). */
export const DISPOSITIVOS = {
  mobile: { rotulo: 'Celular', largura: 390 },
  tablet: { rotulo: 'Tablet', largura: 768 },
  desktop: { rotulo: 'Computador', largura: null },
} as const

export type DispositivoId = keyof typeof DISPOSITIVOS

export const DISPOSITIVO_PADRAO: DispositivoId = 'mobile'
export const LARGURA_MIN = 320
export const LARGURA_MAX = 1600

export function resolverDispositivo(valor: unknown): DispositivoId {
  return valor === 'mobile' || valor === 'tablet' || valor === 'desktop'
    ? valor
    : DISPOSITIVO_PADRAO
}

export function resolverLargura(valor: unknown): number | null {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
  return Math.min(Math.max(Math.round(valor), LARGURA_MIN), LARGURA_MAX)
}

export function resolverOculta(valor: unknown): boolean {
  return valor === true
}
```

- [ ] **Step 5: Implement `aparencia-presets.ts`**

```ts
/** Seleção de tema por ids (strings dos enums do domínio). */
export type TemaSelecao = {
  paleta: string
  estilo: string
  formatoCard: string
  layout: string
  fonte: string
}

export type PresetAparencia = {
  id: string
  nome: string
  descricao: string
  tema: TemaSelecao
}

/** Combos prontos (RF-7), montados sobre os catálogos existentes de `lib/visual`. */
export const PRESETS_APARENCIA: readonly PresetAparencia[] = [
  {
    id: 'oceano-classico',
    nome: 'Oceano clássico',
    descricao: 'Azul confiável, grade densa e leitura neutra.',
    tema: { paleta: 'OCEANO', estilo: 'CLASSICO', formatoCard: 'QUADRADO', layout: 'GRADE_DENSA', fonte: 'SANS' },
  },
  {
    id: 'esmeralda-moderno',
    nome: 'Esmeralda moderno',
    descricao: 'Verde acolhedor com cartões grandes e respiro.',
    tema: { paleta: 'ESMERALDA', estilo: 'MODERNO', formatoCard: 'QUADRADO', layout: 'GRADE_LARGA', fonte: 'MANROPE' },
  },
  {
    id: 'blush-minimal',
    nome: 'Blush minimal',
    descricao: 'Rosa delicado, lista enxuta e visual limpo.',
    tema: { paleta: 'BLUSH', estilo: 'MINIMAL', formatoCard: 'PANORAMICO', layout: 'LISTA', fonte: 'SANS' },
  },
  {
    id: 'terra-vibrante',
    nome: 'Terra vibrante',
    descricao: 'Terracota quente com retratos e personalidade.',
    tema: { paleta: 'TERRA', estilo: 'VIBRANTE', formatoCard: 'RETRATO', layout: 'GRADE_DENSA', fonte: 'SERIF' },
  },
  {
    id: 'lilas-moderno',
    nome: 'Lilás moderno',
    descricao: 'Violeta criativo com título em destaque.',
    tema: { paleta: 'LILAS', estilo: 'MODERNO', formatoCard: 'QUADRADO', layout: 'GRADE_LARGA', fonte: 'DISPLAY' },
  },
  {
    id: 'carvao-minimal',
    nome: 'Carvão minimal',
    descricao: 'Preto elegante com primeiro produto em destaque.',
    tema: { paleta: 'CARVAO', estilo: 'MINIMAL', formatoCard: 'RETRATO', layout: 'DESTAQUE', fonte: 'MONO' },
  },
]

export function presetParaTema(preset: PresetAparencia): TemaSelecao {
  return { ...preset.tema }
}

export function encontrarPreset(tema: TemaSelecao): PresetAparencia | null {
  return (
    PRESETS_APARENCIA.find(
      (preset) =>
        preset.tema.paleta === tema.paleta &&
        preset.tema.estilo === tema.estilo &&
        preset.tema.formatoCard === tema.formatoCard &&
        preset.tema.layout === tema.layout &&
        preset.tema.fonte === tema.fonte
    ) ?? null
  )
}
```

- [ ] **Step 6: Implement `option-card.tsx`**

```tsx
'use client'

import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

/** Padrão único de cartão selecionável para opções de aparência (RF-8). */
export function OptionCard({
  selecionado,
  aoSelecionar,
  label,
  titulo,
  children,
}: {
  selecionado: boolean
  aoSelecionar: () => void
  label: string
  titulo: string
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      aria-label={label}
      onClick={aoSelecionar}
      className={cn(
        'group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left outline-none transition-colors',
        'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        selecionado ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:bg-muted'
      )}
    >
      {children}
      <span className="text-xs font-medium leading-tight">{titulo}</span>
      {selecionado && (
        <span
          className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="size-3" />
        </span>
      )}
    </button>
  )
}
```

- [ ] **Step 7: Run tests + verify**

Run: `npm test -- tests/unit/lib/editor-estado.test.ts tests/unit/lib/aparencia-presets.test.ts tests/unit/lib/preview-dispositivos.test.ts && npm run typecheck && npm run lint`
Expected: PASS, sem erros.

- [ ] **Step 8: Commit**

```bash
git add src/components/features/aparencia tests/unit/lib
git commit -m "feat(aparencia): lógica pura do editor (estado, dispositivos, presets)"
```

---

### Task 3: Prévia persistente (RF-5, RF-6) e memoização

**Files:**
- Create: `src/components/features/aparencia/use-media-query.ts`
- Create: `src/components/features/aparencia/use-editor-preferencias.ts`
- Create: `src/components/features/aparencia/preview-panel.tsx`
- Modify: `src/components/features/vitrine/storefront.tsx` (export memoizado)
- Modify: `src/components/features/vitrine/experience-renderer.tsx` (memo)
- Modify: `src/components/features/vitrine/product-card.tsx` (memo)

**Interfaces:**
- Consumes: `Storefront`, `VitrineView`, `DISPOSITIVOS`/`resolver*` (Task 2), `Sheet`, `Dialog`.
- Produces (usados pelas Tasks D, F):
  - `useMediaQuery(query: string): boolean`
  - `type PreferenciasEditor = { modoAvancado: boolean; dispositivo: DispositivoId; largura: number | null; oculta: boolean; telaCheia: boolean }`
  - `useEditorPreferencias(): { prefs: PreferenciasEditor; pronto: boolean; atualizar(patch: Partial<PreferenciasEditor>): void }`
  - `PreviewPanel({ vitrine, prefs, onAtualizar, abertoMobile, onAbertoMobileChange })` — coluna persistente (lg+), tela cheia (Dialog), Sheet no mobile e ocultar/mostrar.

- [ ] **Step 1: Implement `use-media-query.ts`**

```ts
'use client'

import { useEffect, useState } from 'react'

/** Media query SSR-safe: false no primeiro paint, corrigida após o mount. */
export function useMediaQuery(query: string): boolean {
  const [combina, setCombina] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const atualizar = () => setCombina(media.matches)
    atualizar()
    media.addEventListener('change', atualizar)
    return () => media.removeEventListener('change', atualizar)
  }, [query])

  return combina
}
```

- [ ] **Step 2: Implement `use-editor-preferencias.ts`**

```ts
'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  DISPOSITIVO_PADRAO,
  resolverDispositivo,
  resolverLargura,
  resolverOculta,
  type DispositivoId,
} from './preview-dispositivos'

const CHAVE = 'vitrine:editor:preferencias:v1'

export type PreferenciasEditor = {
  modoAvancado: boolean
  dispositivo: DispositivoId
  largura: number | null
  oculta: boolean
  telaCheia: boolean
}

const PADRAO: PreferenciasEditor = {
  modoAvancado: false,
  dispositivo: DISPOSITIVO_PADRAO,
  largura: null,
  oculta: false,
  telaCheia: false,
}

export function useEditorPreferencias() {
  const [prefs, setPrefs] = useState<PreferenciasEditor>(PADRAO)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE)
      if (bruto) {
        const dado = JSON.parse(bruto) as Record<string, unknown>
        setPrefs({
          modoAvancado: dado.modoAvancado === true,
          dispositivo: resolverDispositivo(dado.dispositivo),
          largura: resolverLargura(dado.largura),
          oculta: resolverOculta(dado.oculta),
          telaCheia: false,
        })
      }
    } catch {
      // storage indisponível: segue com padrões
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto) return
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(prefs))
    } catch {
      // sem persistência: estado em memória continua
    }
  }, [prefs, pronto])

  const atualizar = useCallback((patch: Partial<PreferenciasEditor>) => {
    setPrefs((atual) => ({ ...atual, ...patch }))
  }, [])

  return { prefs, pronto, atualizar }
}
```

- [ ] **Step 3: Implement `preview-panel.tsx`**

```tsx
'use client'

import { useDeferredValue } from 'react'
import { Eye, EyeOff, Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Storefront } from '@/components/features/vitrine/storefront'
import type { VitrineView } from '@/lib/vitrine-view'

import { DISPOSITIVOS, type DispositivoId } from './preview-dispositivos'
import { useMediaQuery } from './use-media-query'
import type { PreferenciasEditor } from './use-editor-preferencias'

const ICONES: Record<DispositivoId, typeof Smartphone> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
}

function BarraPreview({
  prefs,
  onAtualizar,
}: {
  prefs: PreferenciasEditor
  onAtualizar: (patch: Partial<PreferenciasEditor>) => void
}) {
  return (
    <div className="flex items-center gap-1 border-b p-2">
      <div className="flex items-center gap-1" role="group" aria-label="Tamanho da prévia">
        {(Object.keys(DISPOSITIVOS) as DispositivoId[]).map((id) => {
          const Icone = ICONES[id]
          const ativo = prefs.dispositivo === id
          return (
            <Button
              key={id}
              variant={ativo ? 'secondary' : 'ghost'}
              size="icon-sm"
              aria-label={`Prévia ${DISPOSITIVOS[id].rotulo}`}
              aria-pressed={ativo}
              onClick={() => onAtualizar({ dispositivo: id, largura: DISPOSITIVOS[id].largura })}
            >
              <Icone aria-hidden="true" />
            </Button>
          )
        })}
      </div>
      <span className="flex-1" />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Abrir prévia em tela cheia"
        onClick={() => onAtualizar({ telaCheia: true })}
      >
        <Maximize2 aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Ocultar prévia"
        onClick={() => onAtualizar({ oculta: true })}
      >
        <EyeOff aria-hidden="true" />
      </Button>
    </div>
  )
}

function Moldura({ vitrine, largura }: { vitrine: VitrineView; largura: number | null }) {
  // Deferir o objeto inteiro só tem efeito com o Storefront memoizado (Task 3):
  // no render urgente (tecla) a criança memoizada ignora a referência antiga.
  const vitrineDeferida = useDeferredValue(vitrine)
  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/40 p-3">
      <div
        className="h-full overflow-hidden rounded-xl ring-1 ring-border"
        style={{ width: largura ?? '100%', maxWidth: '100%' }}
      >
        <Storefront vitrine={vitrineDeferida} preview />
      </div>
    </div>
  )
}

export function PreviewPanel({
  vitrine,
  prefs,
  onAtualizar,
  abertoMobile,
  onAbertoMobileChange,
}: {
  vitrine: VitrineView
  prefs: PreferenciasEditor
  onAtualizar: (patch: Partial<PreferenciasEditor>) => void
  abertoMobile: boolean
  onAbertoMobileChange: (aberto: boolean) => void
}) {
  const ehDesktop = useMediaQuery('(min-width: 64rem)')

  const conteudo = (
    <div className="flex h-full min-h-0 flex-col">
      <BarraPreview prefs={prefs} onAtualizar={onAtualizar} />
      <Moldura vitrine={vitrine} largura={prefs.largura} />
    </div>
  )

  const mostrarColuna = ehDesktop && !prefs.oculta && !prefs.telaCheia

  return (
    <>
      {mostrarColuna ? (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          {conteudo}
        </div>
      ) : null}

      {ehDesktop && prefs.oculta ? (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAtualizar({ oculta: false })}
        >
          <Eye data-icon="inline-start" />
          Mostrar prévia
        </Button>
      ) : null}

      {!ehDesktop && !prefs.telaCheia ? (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAbertoMobileChange(true)}
        >
          <Eye data-icon="inline-start" />
          Prévia
        </Button>
      ) : null}

      <Sheet open={abertoMobile} onOpenChange={onAbertoMobileChange}>
        <SheetContent side="bottom" className="h-[85svh] p-0">
          <SheetTitle className="sr-only">Prévia da vitrine</SheetTitle>
          {conteudo}
        </SheetContent>
      </Sheet>

      <Dialog open={prefs.telaCheia} onOpenChange={(aberto) => onAtualizar({ telaCheia: aberto })}>
        <DialogContent className="h-[92svh] w-[95vw] max-w-none p-0 sm:max-w-none">
          <DialogTitle className="sr-only">Prévia em tela cheia</DialogTitle>
          {conteudo}
        </DialogContent>
      </Dialog>
    </>
  )
}
```

> Só uma instância da prévia fica montada por vez: a coluna existe em `lg+` e some quando oculta/tela cheia; no mobile/tablet a prévia vive no `Sheet` (desmontado quando fechado). O mesmo elemento `conteudo` é reusado, o que monta instâncias separadas apenas quando o overlay abre.

- [ ] **Step 4: Memoize the storefront chain**

Em `src/components/features/vitrine/storefront.tsx`, trocar
`export function Storefront(` por `export const Storefront = memo(function Storefront(`
com `import { memo, useState } from 'react'` e fechar com `})`.

Em `src/components/features/vitrine/experience-renderer.tsx`, trocar
`export function ExperienceRenderer(` por `export const ExperienceRenderer = memo(function ExperienceRenderer(`
com `import { memo, type ReactNode } from 'react'` e fechar com `})`.

Em `src/components/features/vitrine/product-card.tsx`, trocar
`export function ProductCard(` por `export const ProductCard = memo(function ProductCard(`
com `import { memo } from 'react'` e fechar com `})`.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/aparencia src/components/features/vitrine
git commit -m "feat(aparencia): prévia persistente com presets, tela cheia e memoização"
```

---

### Task 4: Painel de Conteúdo e inspector adaptativo (RF-4)

**Files:**
- Create: `src/components/features/aparencia/conteudo-panel.tsx`
- Modify: `src/components/features/aparencia/block-form.tsx` (remover anti-patterns de render)

**Interfaces:**
- Consumes: `useMediaQuery` (Task 3), `PaginaExperiencia`/`BlocoExperiencia`/`BlockType` (`@/lib/experience`), `BlockForm`, `Button`, `Empty`, `Sheet`, `Separator`.
- Produces (usados pela Task F):
  - `ConteudoPanel({ paginas, paginaId, selectedId, onSelecionarBloco, onAtualizarBloco, onMoverBloco, onDuplicarBloco, onAlternarVisivel, onRemoverBloco, onAdicionarBloco, base, isSaving, maxBlocks, advanced })`

- [ ] **Step 1: Implement `conteudo-panel.tsx`**

Comportamento por breakpoint (RF-4): `ehDesktop = useMediaQuery('(min-width: 64rem)')`,
`ehTablet = useMediaQuery('(min-width: 48rem)')`.
- Desktop: coluna de propriedades recolhível (`BlockForm` num painel à direita do painel de edição). Sem bloco selecionado → mensagem.
- Tablet (>=48rem e <64rem): propriedades em `Sheet` lateral aberto ao selecionar.
- Mobile (<48rem): propriedades em acordeão inline logo abaixo do bloco selecionado.

```tsx
'use client'

import { ArrowDown, ArrowUp, Copy, Eye, EyeOff, Layers3, Lock, Plus, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Empty, EmptyDescription, EmptyTitle } from '@/components/ui/empty'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  blockCatalog,
  blockTypeLabel,
  type BlocoExperiencia,
  type BlockType,
  type PaginaExperiencia,
} from '@/lib/experience'
import type { VitrineBase } from '@/lib/vitrine-view'
import { cn } from '@/lib/utils'

import { BlockForm } from './block-form'
import { useMediaQuery } from './use-media-query'

export function ConteudoPanel({
  paginas,
  paginaId,
  selectedId,
  onSelecionarBloco,
  onAtualizarBloco,
  onMoverBloco,
  onDuplicarBloco,
  onAlternarVisivel,
  onRemoverBloco,
  onAdicionarBloco,
  base,
  isSaving,
  maxBlocks,
  advanced,
}: {
  paginas: PaginaExperiencia[]
  paginaId: string
  selectedId: string | null
  onSelecionarBloco: (id: string | null) => void
  onAtualizarBloco: (id: string, valores: { label: string } & Record<string, unknown>) => void
  onMoverBloco: (id: string, direcao: -1 | 1) => void
  onDuplicarBloco: (id: string) => void
  onAlternarVisivel: (id: string) => void
  onRemoverBloco: (id: string) => void
  onAdicionarBloco: (tipo: BlockType) => void
  base: VitrineBase
  isSaving: boolean
  maxBlocks: number
  advanced: boolean
}) {
  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const selected = paginaAtiva?.blocos.find((b) => b.id === selectedId) ?? null
  const ehDesktop = useMediaQuery('(min-width: 64rem)')
  const ehTablet = useMediaQuery('(min-width: 48rem)')

  const formulario = selected ? (
    <BlockForm
      bloco={selected}
      produtos={base.produtos}
      categorias={base.categorias}
      onChange={(valores) => onAtualizarBloco(selected.id, valores)}
    />
  ) : (
    <p className="text-sm text-muted-foreground">
      Selecione um bloco para editar as propriedades.
    </p>
  )

  return (
    <div className={cn('flex min-h-0 flex-1 flex-col gap-4 lg:flex-row')}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
        <div className="flex items-center justify-between rounded-lg border bg-background p-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Layers3 className="size-4 text-primary" aria-hidden="true" />
            Estrutura da página
          </span>
          <span className="text-muted-foreground">
            {paginaAtiva?.blocos.length ?? 0}/{maxBlocks} blocos
          </span>
        </div>

        {!paginaAtiva || paginaAtiva.blocos.length === 0 ? (
          <Empty>
            <EmptyTitle>Página vazia</EmptyTitle>
            <EmptyDescription>
              Adicione o primeiro bloco para começar a montar esta página.
            </EmptyDescription>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-2">
            {paginaAtiva.blocos.map((bloco, indice) => (
              <li key={bloco.id}>
                <ItemBloco
                  bloco={bloco}
                  indice={indice}
                  total={paginaAtiva.blocos.length}
                  selecionado={selectedId === bloco.id}
                  onSelecionar={() => onSelecionarBloco(bloco.id)}
                  onMover={(d) => onMoverBloco(bloco.id, d)}
                  onDuplicar={() => onDuplicarBloco(bloco.id)}
                  onAlternarVisivel={() => onAlternarVisivel(bloco.id)}
                  onRemover={() => onRemoverBloco(bloco.id)}
                />
                {!ehTablet && selectedId === bloco.id && (
                  <div className="mt-2 rounded-lg border bg-muted/30 p-3">{formulario}</div>
                )}
              </li>
            ))}
          </ul>
        )}

        <Separator />

        <CatalogoBlocos advanced={advanced} isSaving={isSaving} onAdicionar={onAdicionarBloco} />
      </div>

      {ehDesktop && (
        <div className="hidden min-h-0 w-80 shrink-0 flex-col overflow-y-auto border-l p-4 lg:flex">
          <h3 className="mb-3 font-heading text-sm font-semibold">Propriedades</h3>
          {formulario}
        </div>
      )}

      {ehTablet && !ehDesktop && (
        <Sheet open={!!selected} onOpenChange={(aberto) => !aberto && onSelecionarBloco(null)}>
          <SheetContent side="right" className="w-full overflow-y-auto p-4 sm:max-w-md">
            <SheetTitle>Propriedades do bloco</SheetTitle>
            {formulario}
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
```

```tsx
function ItemBloco({
  bloco,
  indice,
  total,
  selecionado,
  onSelecionar,
  onMover,
  onDuplicar,
  onAlternarVisivel,
  onRemover,
}: {
  bloco: BlocoExperiencia
  indice: number
  total: number
  selecionado: boolean
  onSelecionar: () => void
  onMover: (direcao: -1 | 1) => void
  onDuplicar: () => void
  onAlternarVisivel: () => void
  onRemover: () => void
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border p-2',
        selecionado ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-background'
      )}
    >
      <Button
        variant="ghost"
        className="min-w-0 flex-1 justify-start gap-3"
        aria-pressed={selecionado}
        onClick={onSelecionar}
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold"
          aria-hidden="true"
        >
          {bloco.type.slice(0, 1).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-col items-start">
          <span className="truncate font-medium">{bloco.label}</span>
          <span className="truncate text-xs text-muted-foreground">
            {blockTypeLabel(bloco.type)} · {bloco.visible ? 'Visível' : 'Oculto'}
          </span>
        </span>
      </Button>

      <div className="flex shrink-0 items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Mover bloco para cima"
          disabled={indice === 0}
          onClick={() => onMover(-1)}
        >
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Mover bloco para baixo"
          disabled={indice === total - 1}
          onClick={() => onMover(1)}
        >
          <ArrowDown aria-hidden="true" />
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Duplicar bloco" onClick={onDuplicar}>
          <Copy aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={bloco.visible ? 'Ocultar bloco' : 'Mostrar bloco'}
          onClick={onAlternarVisivel}
        >
          {bloco.visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
        <Button variant="ghost" size="icon-sm" aria-label="Excluir bloco" onClick={onRemover}>
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

function CatalogoBlocos({
  advanced,
  isSaving,
  onAdicionar,
}: {
  advanced: boolean
  isSaving: boolean
  onAdicionar: (tipo: BlockType) => void
}) {
  const essenciais = blockCatalog.filter((item) => item.plan === 'ESSENCIAL')
  const avancados = blockCatalog.filter((item) => item.plan === 'LIVRE')

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Essenciais
        </p>
        {essenciais.map((item) => (
          <Button
            key={item.type}
            variant="outline"
            className="justify-start"
            disabled={isSaving}
            onClick={() => onAdicionar(item.type)}
          >
            <Plus data-icon="inline-start" />
            {item.label}
          </Button>
        ))}
      </div>

      <Separator />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Avançados
          </p>
          {!advanced && <Lock className="size-3.5 text-muted-foreground" aria-hidden="true" />}
        </div>
        {avancados.map((item) => (
          <Button
            key={item.type}
            variant="outline"
            className="justify-start"
            disabled={!advanced || isSaving}
            onClick={() => onAdicionar(item.type)}
          >
            {advanced ? <Plus data-icon="inline-start" /> : <Lock data-icon="inline-start" />}
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
```

Os botões de seleção usam `aria-pressed` (não `role="button"` no contêiner) e as ações têm `aria-label` com ícones `aria-hidden`.

- [ ] **Step 2: Clean `block-form.tsx`**

Em `src/components/features/aparencia/block-form.tsx`:
1. Trocar `const schema = z.object({...})` por `const schema = useMemo(() => z.object({...}), [bloco.type])` (import `useMemo`).
2. Trocar `mode: 'onChange'` por `mode: 'onBlur'`.
3. Remover `const valido = schema.safeParse(form.watch()).success` e o bloco `{!valido && (<FieldError>...)}`.
4. Remover o prop `onLabelChange` (o label passa a fazer parte do `onChange` do bloco): `propagar()` chama apenas `onChange({ label, ...props })` — ou remover `label` do payload e manter o label fora das props. **Decisão:** manter `label` no payload e ajustar o consumidor (Task F) para aplicar `label` e `props` juntos.

> Mudança de contrato: `BlockForm` passa a ter `onChange(valores: { label: string } & Record<string, unknown>)` (sem `onLabelChange`). O shell da Task F aplica label e props num único update.

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: PASS (a Task F ainda não consome `ConteudoPanel`; ele compila isolado).

- [ ] **Step 4: Commit**

```bash
git add src/components/features/aparencia
git commit -m "feat(aparencia): painel de conteúdo com inspector adaptativo"
```

---

### Task 5: Painel de Aparência — presets + modo avançado (RF-7, RF-8)

**Files:**
- Create: `src/components/features/aparencia/aparencia-panel.tsx`

**Interfaces:**
- Consumes: `TemaView`, `PRESETS_APARENCIA`/`presetParaTema`/`encontrarPreset` (Task 2), `OptionCard`, catálogos `@/lib/visual`, `UploadImagem`, `Switch`, `FieldGroup`/`Field`/`FieldLabel`, `Accordion` (não existe — usar grupos com `details`/estado local).
- Produces (usado pela Task F):
  - `AparenciaPanel({ tema, onChange, modoAvancado, onModoAvancadoChange })`

- [ ] **Step 1: Implement `aparencia-panel.tsx`**

```tsx
'use client'

import { useState, type ReactNode } from 'react'

import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { UploadImagem } from '@/components/patterns/upload-imagem'
import {
  ESTILOS,
  FONTES,
  FORMATOS_CARD,
  LAYOUTS,
  PALETAS,
} from '@/lib/visual'
import { cn } from '@/lib/utils'
import type { TemaView } from '@/app/actions/tema'

import {
  PRESETS_APARENCIA,
  encontrarPreset,
  presetParaTema,
  type TemaSelecao,
} from './aparencia-presets'
import { OptionCard } from './option-card'

function Grupo({
  titulo,
  aberto,
  onAlternar,
  children,
}: {
  titulo: string
  aberto: boolean
  onAlternar: () => void
  children: ReactNode
}) {
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberto}
        className="flex w-full items-center justify-between p-3 text-left text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {titulo}
        <span aria-hidden="true">{aberto ? '−' : '+'}</span>
      </button>
      {aberto && <div className="border-t p-3">{children}</div>}
    </div>
  )
}

export function AparenciaPanel({
  tema,
  onChange,
  modoAvancado,
  onModoAvancadoChange,
}: {
  tema: TemaView
  onChange: (patch: Partial<TemaView>) => void
  modoAvancado: boolean
  onModoAvancadoChange: (ativo: boolean) => void
}) {
  const [aberto, setAberto] = useState<string | null>('cores')
  const selecao: TemaSelecao = {
    paleta: tema.paleta,
    estilo: tema.estilo,
    formatoCard: tema.formatoCard,
    layout: tema.layout,
    fonte: tema.fonte,
  }
  const presetAtivo = encontrarPreset(selecao)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
      <Field orientation="horizontal">
        <FieldLabel htmlFor="modo-avancado">Modo avançado</FieldLabel>
        <Switch
          id="modo-avancado"
          checked={modoAvancado}
          onCheckedChange={onModoAvancadoChange}
        />
      </Field>

      {!modoAvancado ? (
        <div className="grid grid-cols-2 gap-3">
          {PRESETS_APARENCIA.map((preset) => (
            <OptionCard
              key={preset.id}
              selecionado={presetAtivo?.id === preset.id}
              aoSelecionar={() => onChange(presetParaTema(preset) as Partial<TemaView>)}
              label={`Usar tema ${preset.nome}`}
              titulo={preset.nome}
            >
              <span
                className="h-6 w-full rounded-md border"
                style={{
                  background: `linear-gradient(135deg, ${
                    PALETAS.find((p) => p.id === preset.tema.paleta)?.corPrimaria
                  }, ${PALETAS.find((p) => p.id === preset.tema.paleta)?.corSecundaria})`,
                }}
                aria-hidden="true"
              />
              <span className="text-xs text-muted-foreground">{preset.descricao}</span>
            </OptionCard>
          ))}
        </div>
      ) : (
        <FieldGroup className="gap-3">
          <Grupo titulo="Cores" aberto={aberto === 'cores'} onAlternar={() => setAberto(aberto === 'cores' ? null : 'cores')}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {PALETAS.map((p) => (
                <OptionCard
                  key={p.id}
                  selecionado={tema.paleta === p.id}
                  aoSelecionar={() => onChange({ paleta: p.id })}
                  label={`Paleta ${p.nome}`}
                  titulo={p.nome}
                >
                  <span className="flex size-8 items-center rounded-full border" style={{ backgroundColor: p.corFundo }} aria-hidden="true">
                    <span className="ml-1 size-3.5 rounded-full" style={{ backgroundColor: p.corPrimaria }} />
                    <span className="ml-0.5 size-3.5 rounded-full" style={{ backgroundColor: p.corSecundaria }} />
                  </span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Estilo dos cards" aberto={aberto === 'estilo'} onAlternar={() => setAberto(aberto === 'estilo' ? null : 'estilo')}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {ESTILOS.map((e) => (
                <OptionCard key={e.id} selecionado={tema.estilo === e.id} aoSelecionar={() => onChange({ estilo: e.id })} label={`Estilo ${e.nome}`} titulo={e.nome}>
                  <span className="text-xs text-muted-foreground">{e.descricao}</span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Layout da grade" aberto={aberto === 'layout'} onAlternar={() => setAberto(aberto === 'layout' ? null : 'layout')}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {LAYOUTS.map((l) => (
                <OptionCard key={l.id} selecionado={tema.layout === l.id} aoSelecionar={() => onChange({ layout: l.id })} label={`Layout ${l.nome}`} titulo={l.nome}>
                  <span className="text-xs text-muted-foreground">{l.descricao}</span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Formato do card" aberto={aberto === 'formato'} onAlternar={() => setAberto(aberto === 'formato' ? null : 'formato')}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {FORMATOS_CARD.map((f) => (
                <OptionCard key={f.id} selecionado={tema.formatoCard === f.id} aoSelecionar={() => onChange({ formatoCard: f.id })} label={`Formato ${f.nome}`} titulo={f.nome}>
                  <span className={cn('w-10 rounded-md border bg-muted', f.aspecto)} aria-hidden="true" />
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Tipografia" aberto={aberto === 'fonte'} onAlternar={() => setAberto(aberto === 'fonte' ? null : 'fonte')}>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FONTES.map((f) => (
                <OptionCard key={f.id} selecionado={tema.fonte === f.id} aoSelecionar={() => onChange({ fonte: f.id })} label={`Fonte ${f.nome}`} titulo={f.nome}>
                  <span className="text-base leading-tight" style={{ fontFamily: f.css }}>Aa</span>
                </OptionCard>
              ))}
            </div>
          </Grupo>

          <Grupo titulo="Marca e logo" aberto={aberto === 'logo'} onAlternar={() => setAberto(aberto === 'logo' ? null : 'logo')}>
            <Field>
              <FieldLabel htmlFor="logo-url">Logo</FieldLabel>
              <UploadImagem
                tipo="logo"
                value={tema.logoUrl}
                onChange={(url) => onChange({ logoUrl: url })}
                descricao="Use uma imagem quadrada (ex.: 512x512), até 5 MB."
              />
            </Field>
          </Grupo>
        </FieldGroup>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/features/aparencia
git commit -m "feat(aparencia): presets e modo avançado de ajuste fino"
```

---

### Task 6: Shell do editor, prefetch e navegação (RF-1, RF-2, RF-3, RF-9, RF-10, RF-11)

**Files:**
- Create: `src/components/features/aparencia/vitrine-editor.tsx`
- Modify: `src/app/dashboard/aparencia/page.tsx`
- Modify: `src/components/layout/app-sidebar.tsx` (rótulo "Vitrine")
- Delete: `src/components/features/aparencia/experience-builder.tsx`
- Delete: `src/components/features/aparencia/preview-vitrine.tsx`
- Delete: `src/components/features/aparencia/tema-form.tsx`
- Modify: `src/app/actions/experiencia.ts` (remove `carregarExperienciaAction`/`carregarBasePreviewAction`)
- Modify: `src/app/actions/tema.ts` (remove `carregarTemaAction`)

**Interfaces:**
- Consumes: Tasks 1–5 (`ConteudoPanel`, `AparenciaPanel`, `PreviewPanel`, `useEditorPreferencias`, pure modules), `salvarExperienciaAction`, `alterarTemaAction`, `getMinhaLoja`/`requireMinhaLoja`, `serializeVitrineBase`, `container.catalogoService.listarPorId`, `initialPages`.
- Produces: rota `/dashboard/aparencia` renderizando o editor unificado; estado inicial via props.

- [ ] **Step 1: Implement `vitrine-editor.tsx`**

Estrutura obrigatória:
- Props: `{ paginasIniciais, base, temaInicial }`.
- Estado: `paginas`, `tema`, `modo`, `paginaId`, `selectedId`, `sujeira`, `isSaving`, `erro`, `previewMobileAberto`.
- `useEditorPreferencias()` para `modoAvancado`/dispositivo/largura/oculta/telaCheia.
- `vitrinePreview: VitrineView` memoizado, recomputando as cores da paleta.
- Barra (`BarraEditor`) com `Tabs` de páginas, ações de renomear/remover/adicionar, `Badge` de pendência e botão de salvar contextual com `Spinner`.
- Sem `router.refresh()` após salvar (RF-10).

```tsx
'use client'

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { Pencil, Plus, Save, Trash2 } from 'lucide-react'

import { salvarExperienciaAction } from '@/app/actions/experiencia'
import { alterarTemaAction } from '@/app/actions/loja'
import type { TemaView } from '@/app/actions/tema'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/ui/toast'
import {
  createBlock,
  duplicateBlock,
  moveBlock,
  planCapabilities,
  templates,
  type BlockType,
  type PaginaExperiencia,
} from '@/lib/experience'
import { obterPaleta } from '@/lib/visual'
import type { VitrineBase, VitrineView } from '@/lib/vitrine-view'

import { AparenciaPanel } from './aparencia-panel'
import { ConteudoPanel } from './conteudo-panel'
import { limparSujo, marcarSujo, sujeiraInicial, temAlteracoes } from './editor-estado'
import { PreviewPanel } from './preview-panel'
import { resolverLargura } from './preview-dispositivos'
import { useEditorPreferencias } from './use-editor-preferencias'

const CAPACIDADES = planCapabilities.LIVRE

export function VitrineEditor({
  paginasIniciais,
  base,
  temaInicial,
}: {
  paginasIniciais: PaginaExperiencia[]
  base: VitrineBase
  temaInicial: TemaView
}) {
  const { prefs, atualizar } = useEditorPreferencias()
  const [modo, setModo] = useState<'conteudo' | 'aparencia'>('conteudo')
  const [paginas, setPaginas] = useState<PaginaExperiencia[]>(paginasIniciais)
  const [tema, setTema] = useState<TemaView>(temaInicial)
  const [paginaId, setPaginaId] = useState(paginasIniciais[0]?.id ?? '')
  const [selectedId, setSelectedId] = useState<string | null>(
    paginasIniciais[0]?.blocos[0]?.id ?? null
  )
  const [sujeira, setSujeira] = useState(sujeiraInicial)
  const [isSaving, setIsSaving] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [previewMobileAberto, setPreviewMobileAberto] = useState(false)

  const vitrinePreview: VitrineView = useMemo(() => {
    const paleta = obterPaleta(tema.paleta)
    return {
      ...base,
      tema: {
        ...base.tema,
        paleta: tema.paleta,
        estilo: tema.estilo,
        formatoCard: tema.formatoCard,
        layout: tema.layout,
        fonte: tema.fonte,
        logoUrl: tema.logoUrl,
        corPrimaria: paleta.corPrimaria,
        corSecundaria: paleta.corSecundaria,
        corFundo: paleta.corFundo,
      },
      paginas,
    }
  }, [base, paginas, tema])

  useEffect(() => {
    if (!temAlteracoes(sujeira)) return
    const avisar = (evento: BeforeUnloadEvent) => {
      evento.preventDefault()
      evento.returnValue = ''
    }
    window.addEventListener('beforeunload', avisar)
    return () => window.removeEventListener('beforeunload', avisar)
  }, [sujeira])

  function trocarModo(proximo: 'conteudo' | 'aparencia') {
    if (proximo === modo) return
    if (sujeira[modo]) {
      const confirmar = window.confirm(
        'Há alterações não salvas neste modo. Descartar e trocar?'
      )
      if (!confirmar) return
      setSujeira((s) => limparSujo(s, modo))
      restaurarRascunho(modo)
    }
    setModo(proximo)
  }

  // Ao descartar, restaura o estado do domínio a partir das props iniciais.
  function restaurarRascunho(dominio: 'conteudo' | 'aparencia') {
    if (dominio === 'conteudo') setPaginas(paginasIniciais)
    else setTema(temaInicial)
  }

  function atualizarPagina(atualiza: (pagina: PaginaExperiencia) => PaginaExperiencia) {
    setPaginas((atuais) => atuais.map((p) => (p.id === paginaId ? atualiza(p) : p)))
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  function onAtualizarBloco(id: string, valores: { label: string } & Record<string, unknown>) {
    const { label, ...props } = valores
    atualizarPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b) => (b.id === id ? { ...b, label, props } : b)),
    }))
  }

  function onMoverBloco(id: string, direcao: -1 | 1) {
    atualizarPagina((p) => ({ ...p, blocos: moveBlock(p.blocos, id, direcao) }))
  }

  function onDuplicarBloco(id: string) {
    atualizarPagina((p) => ({ ...p, blocos: duplicateBlock(p.blocos, id) }))
  }

  function onAlternarVisivel(id: string) {
    atualizarPagina((p) => ({
      ...p,
      blocos: p.blocos.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)),
    }))
  }

  function onRemoverBloco(id: string) {
    atualizarPagina((p) => ({ ...p, blocos: p.blocos.filter((b) => b.id !== id) }))
  }

  function onAdicionarBloco(tipo: BlockType) {
    let novoId = ''
    atualizarPagina((p) => {
      if (p.blocos.length >= CAPACIDADES.maxBlocks) return p
      const bloco = createBlock(tipo)
      novoId = bloco.id
      return { ...p, blocos: [...p.blocos, bloco] }
    })
    if (novoId) setSelectedId(novoId)
  }

  function adicionarPagina(template: ReturnType<typeof templates>[number]) {
    if (paginas.length >= CAPACIDADES.maxPages) return
    const origem = template.paginas[0]
    const pagina: PaginaExperiencia = {
      ...origem,
      id: `pagina-${Date.now()}`,
      ordem: paginas.length,
      blocos: origem.blocos.map((b) => ({ ...b, id: `${b.type}-${Date.now()}-${Math.random()}` })),
    }
    setPaginas((atuais) => [...atuais, pagina])
    setSujeira((s) => marcarSujo(s, 'conteudo'))
    setPaginaId(pagina.id)
    setSelectedId(pagina.blocos[0]?.id ?? null)
  }

  function renomearPagina(id: string, rotulo: string) {
    setPaginas((atuais) => atuais.map((p) => (p.id === id ? { ...p, rotulo } : p)))
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  function removerPagina(id: string) {
    setPaginas((atuais) => {
      if (atuais.length <= 1) return atuais
      const restantes = atuais.filter((p) => p.id !== id)
      setPaginaId(restantes[0].id)
      setSelectedId(restantes[0].blocos[0]?.id ?? null)
      return restantes
    })
    setSujeira((s) => marcarSujo(s, 'conteudo'))
  }

  async function salvarConteudo() {
    setIsSaving(true)
    setErro(null)
    try {
      const resultado = await salvarExperienciaAction(paginas)
      if (!resultado.ok) {
        setErro(resultado.error)
        return
      }
      setSujeira((s) => limparSujo(s, 'conteudo'))
      toast.add({ title: 'Vitrine publicada', description: 'Suas páginas foram atualizadas.', type: 'success' })
    } finally {
      setIsSaving(false)
    }
  }

  async function salvarAparencia() {
    setIsSaving(true)
    setErro(null)
    try {
      const resultado = await alterarTemaAction(tema)
      if (!resultado.ok) {
        setErro(resultado.error)
        return
      }
      setSujeira((s) => limparSujo(s, 'aparencia'))
      toast.add({ title: 'Aparência salva', description: 'Sua vitrine já reflete o novo visual.', type: 'success' })
    } finally {
      setIsSaving(false)
    }
  }

  function redimensionar(evento: ReactPointerEvent<HTMLDivElement>) {
    evento.preventDefault()
    const inicio = evento.clientX
    const larguraInicial = prefs.largura ?? 640
    const aoMover = (movimento: PointerEvent) => {
      atualizar({ largura: resolverLargura(larguraInicial + (inicio - movimento.clientX)) })
    }
    const aoSoltar = () => {
      window.removeEventListener('pointermove', aoMover)
      window.removeEventListener('pointerup', aoSoltar)
    }
    window.addEventListener('pointermove', aoMover)
    window.addEventListener('pointerup', aoSoltar)
  }

  return (
    <div className="flex h-[calc(100dvh-var(--header-height)-3rem)] min-h-0 flex-col gap-4 overflow-hidden">
      <BarraEditor
        paginas={paginas}
        paginaId={paginaId}
        temPendencia={temAlteracoes(sujeira)}
        isSaving={isSaving}
        modo={modo}
        podeRemoverPagina={paginas.length > 1}
        onTrocarPagina={setPaginaId}
        onAdicionarPagina={adicionarPagina}
        onRenomearPagina={renomearPagina}
        onRemoverPagina={removerPagina}
        onSalvar={modo === 'conteudo' ? salvarConteudo : salvarAparencia}
      />

      {erro && (
        <Alert variant="destructive">
          <AlertTitle>Não foi possível salvar</AlertTitle>
          <AlertDescription>{erro}</AlertDescription>
        </Alert>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          <Tabs value={modo} onValueChange={(v) => trocarModo(v as 'conteudo' | 'aparencia')}>
            <div className="border-b p-2">
              <TabsList>
                <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                <TabsTrigger value="aparencia">Aparência</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>

          {modo === 'conteudo' ? (
            <ConteudoPanel
              paginas={paginas}
              paginaId={paginaId}
              selectedId={selectedId}
              onSelecionarBloco={setSelectedId}
              onAtualizarBloco={onAtualizarBloco}
              onMoverBloco={onMoverBloco}
              onDuplicarBloco={onDuplicarBloco}
              onAlternarVisivel={onAlternarVisivel}
              onRemoverBloco={onRemoverBloco}
              onAdicionarBloco={onAdicionarBloco}
              base={base}
              isSaving={isSaving}
              maxBlocks={CAPACIDADES.maxBlocks}
              advanced={CAPACIDADES.advanced}
            />
          ) : (
            <AparenciaPanel
              tema={tema}
              onChange={(patch) => {
                setTema((atual) => ({ ...atual, ...patch }))
                setSujeira((s) => marcarSujo(s, 'aparencia'))
              }}
              modoAvancado={prefs.modoAvancado}
              onModoAvancadoChange={(ativo) => atualizar({ modoAvancado: ativo })}
            />
          )}
        </div>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar prévia"
          onPointerDown={redimensionar}
          className="hidden w-1 shrink-0 cursor-col-resize self-stretch rounded-full bg-border transition-colors hover:bg-primary/40 lg:block"
        />

        <PreviewPanel
          vitrine={vitrinePreview}
          prefs={prefs}
          onAtualizar={atualizar}
          abertoMobile={previewMobileAberto}
          onAbertoMobileChange={setPreviewMobileAberto}
        />
      </div>
    </div>
  )
}

function BarraEditor({
  paginas,
  paginaId,
  temPendencia,
  isSaving,
  modo,
  podeRemoverPagina,
  onTrocarPagina,
  onAdicionarPagina,
  onRenomearPagina,
  onRemoverPagina,
  onSalvar,
}: {
  paginas: PaginaExperiencia[]
  paginaId: string
  temPendencia: boolean
  isSaving: boolean
  modo: 'conteudo' | 'aparencia'
  podeRemoverPagina: boolean
  onTrocarPagina: (id: string) => void
  onAdicionarPagina: (template: ReturnType<typeof templates>[number]) => void
  onRenomearPagina: (id: string, rotulo: string) => void
  onRemoverPagina: (id: string) => void
  onSalvar: () => void
}) {
  const paginaAtiva = paginas.find((p) => p.id === paginaId) ?? paginas[0]
  const [renomeando, setRenomeando] = useState(false)
  const [novoRotulo, setNovoRotulo] = useState(paginaAtiva?.rotulo ?? '')

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Tabs value={paginaId} onValueChange={onTrocarPagina} className="min-w-0 flex-1">
          <TabsList variant="line" className="h-9 w-full justify-start">
            {paginas.map((pagina) => (
              <TabsTrigger key={pagina.id} value={pagina.id}>
                {pagina.rotulo}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Dialog
          open={renomeando}
          onOpenChange={(aberto) => {
            setRenomeando(aberto)
            if (aberto) setNovoRotulo(paginaAtiva?.rotulo ?? '')
          }}
        >
          <DialogTrigger
            render={
              <Button variant="ghost" size="icon-sm" aria-label="Renomear página" disabled={!paginaAtiva}>
                <Pencil aria-hidden="true" />
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renomear página</DialogTitle>
              <DialogDescription>Dê um nome curto que apareça nas abas.</DialogDescription>
            </DialogHeader>
            <Input
              value={novoRotulo}
              onChange={(e) => setNovoRotulo(e.target.value)}
              aria-label="Nome da página"
            />
            <DialogFooter>
              <Button
                onClick={() => {
                  if (novoRotulo.trim()) onRenomearPagina(paginaAtiva.id, novoRotulo.trim())
                  setRenomeando(false)
                }}
              >
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Remover página"
                disabled={!podeRemoverPagina}
              >
                <Trash2 aria-hidden="true" />
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover página?</AlertDialogTitle>
              <AlertDialogDescription>
                A página “{paginaAtiva?.rotulo}” e todos os seus blocos serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={() => onRemoverPagina(paginaAtiva.id)}>
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog>
          <DialogTrigger
            render={
              <Button variant="outline" size="sm" disabled={paginas.length >= CAPACIDADES.maxPages}>
                <Plus data-icon="inline-start" />
                Página
              </Button>
            }
          />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar página</DialogTitle>
              <DialogDescription>Comece por um modelo pronto e personalize depois.</DialogDescription>
            </DialogHeader>
            <div className="flex max-h-[50vh] flex-col gap-3 overflow-y-auto">
              {templates().map((template) => (
                <div key={template.id} className="flex flex-col gap-1 rounded-lg border p-3">
                  <span className="font-medium">{template.label}</span>
                  <span className="text-sm text-muted-foreground">{template.description}</span>
                  <Button variant="outline" size="sm" className="mt-2 self-start" onClick={() => onAdicionarPagina(template)}>
                    Usar modelo
                  </Button>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {temPendencia && <Badge variant="secondary">Alterações não salvas</Badge>}
        <Button size="sm" onClick={onSalvar} disabled={isSaving}>
          {isSaving ? <Spinner data-icon="inline-start" /> : <Save data-icon="inline-start" />}
          {isSaving ? 'Salvando...' : modo === 'conteudo' ? 'Publicar' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
```

> `BarraEditor` usa ícones lucide com `aria-hidden`. `PreviewPanel` recebe a alça como irmão no shell (a alça fica fora do painel de prévia).
>
> Se `templates()` compartilhar referências de blocos, a cópia em `adicionarPagina` já clona ids; mantenha o clone para não mutar o template.

- [ ] **Step 2: Rewrite `aparencia/page.tsx` (prefetch)**

```tsx
import { VitrineEditor } from '@/components/features/aparencia/vitrine-editor'
import { initialPages, type PaginaExperiencia } from '@/lib/experience'
import { container, requireMinhaLoja } from '@/lib/loja'
import { serializeVitrineBase } from '@/lib/vitrine-view'

export default async function AparenciaPage() {
  const loja = await requireMinhaLoja()

  const paginas = loja.getExperiencia().getPaginas()
  const tema = loja.getTema()
  const vitrine = await container.catalogoService.listarPorId(loja.getId().toUUID())

  return (
    <VitrineEditor
      paginasIniciais={(paginas.length > 0 ? [...paginas] : initialPages) as PaginaExperiencia[]}
      base={serializeVitrineBase(vitrine)}
      temaInicial={{
        paleta: tema.getPaleta(),
        estilo: tema.getEstilo(),
        formatoCard: tema.getFormatoCard(),
        layout: tema.getLayout(),
        fonte: tema.getFonte(),
        logoUrl: tema.getLogoUrl()?.getValue() ?? null,
      }}
    />
  )
}
```

Nota: `requireMinhaLoja()` fica **fora** de qualquer `try` (redirect para onboarding funciona).

- [ ] **Step 3: Update sidebar label**

Em `src/components/layout/app-sidebar.tsx`, trocar `{ href: '/dashboard/aparencia', label: 'Aparência', icon: Palette }` por `label: 'Vitrine'`.

- [ ] **Step 4: Remove dead files and read actions**

- Delete `src/components/features/aparencia/experience-builder.tsx`, `preview-vitrine.tsx`, `tema-form.tsx`.
- Em `src/app/actions/experiencia.ts`, remover `carregarExperienciaAction`, `carregarBasePreviewAction` e os tipos associados (manter `salvarExperienciaAction`). Remover os imports que ficarem sem uso (`initialPages`, `serializeVitrineBase`).
- Em `src/app/actions/tema.ts`, remover `carregarTemaAction` e `CarregarTemaResultado` (manter `TemaView`). Remover o import de `requireMinhaLoja`, que fica sem uso.

- [ ] **Step 5: Verify**

Run: `npm run typecheck && npm run lint && npm test`
Expected: PASS. Se o lint acusar imports não usados, remova-os.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(aparencia): editor unificado com prefetch e prévia persistente"
```

---

### Task 7: Acessibilidade, limpeza e verificação final (RF-13)

**Files:**
- Modify: arquivos das Tasks 3–6 conforme os itens abaixo.

- [ ] **Step 1: Checklist de acessibilidade**

- Lista de blocos: `<ul>/<li>` com botão de seleção + botões de ação irmãos (nunca `role="button"` envolvendo botões).
- Presets de dispositivo: `aria-label` + `aria-pressed` dentro de `role="group"` (feito em `preview-panel`).
- Botões icon-only com `aria-label`; ícones `aria-hidden`.
- `DialogTitle`/`SheetTitle` presentes em todos os overlays.
- Foco visível em todos os controles novos.
- Aviso de pendências perceptível (`Badge` "Alterações não salvas" com texto real).

Corrija o que faltar nessas verificações.

- [ ] **Step 2: Varredura de tokens (PRINCIPLES)**

Run: `rg -n "space-[xy]-|rounded-\[|text-\[1[01]px\]|text-white|bg-emerald|bg-amber|dark:" src/components/features/aparencia src/components/features/vitrine`
Expected: nenhuma ocorrência nova (as antigas de `tema-form`/`preview-vitrine` saem com os arquivos removidos). Substitua o que restar por tokens (`text-primary-foreground`, `rounded-sm`, etc.).

- [ ] **Step 3: Full verification**

Run: `npm run typecheck && npm run lint && npm test`
Expected: zero erros, zero testes falhando.

- [ ] **Step 4: QA manual (PRINCIPLES §9 — requer `npm run dev` + `npm run db:seed`)**

1. Abrir `/dashboard/aparencia` sem spinner de entrada e sem waterfall.
2. Trocar Conteúdo ↔ Aparência: a prévia **não** pisca/remonta; mudanças aparecem na hora.
3. Presets aplicam tema completo; toggle avançado revela os grupos; grupos funcionam.
4. Inspector: coluna no desktop, drawer no tablet, acordeão no mobile.
5. Prévia: presets de dispositivo, redimensionar, tela cheia, ocultar; Sheet no mobile.
6. Editar conteúdo, não salvar, trocar de modo → confirmação; fechar a aba → aviso.
7. Publicar → só a experiência é gravada; Salvar aparência → só o tema. Produtos/categorias intactos e sem N+1 (conferir queries).
8. Sidebar mostra "Vitrine"; título "Editor da vitrine"; sem títulos duplicados.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "polish(aparencia): acessibilidade, tokens e QA do editor unificado"
```

---

## Notas de execução

- Cada task termina com um commit e uma verificação (`typecheck`/`lint`/`test`), deixando o app funcional.
- A suíte Vitest não tem DOM; a lógica testável está nas Tasks 1 e 2. As Tasks 3–7 são verificadas por `typecheck`/`lint` e pelo QA manual do Step 4 da Task 7.
- Se algum arquivo crescer demais (ex.: `conteudo-panel.tsx`), extrair `ItemBloco`/`CatalogoBlocos` para arquivos próprios.
