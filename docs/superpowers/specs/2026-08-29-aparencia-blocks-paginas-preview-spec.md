# Spec: Construtor de páginas em camadas, personalização de blocos, preview ao vivo e reinclusão do tema

> **Status:** Aprovado pelo usuário (sections 1–5).
> **Data:** 2026-08-29
> **Esforço:** Arquitetural (mudança de modelo de dados + rework do builder + navegação pública + preview).

## Objetivo

Dar ao lojista controle real sobre a vitrine: (1) personalizar cada bloco com um formulário de conteúdo; (2) criar **várias páginas-camadas** numa mesma `/«slug»`, navegadas por abas fixas na vitrine pública; (3) uma **preview ao vivo** reativa a cada edição; (4) reincluir o editor de tema órfão; (5) completar bloqueios inacabados (renderizar as 13 block types, religar a seleção de produtos).

## Escopo

- Blocos personalizáveis por tipo (somente conteúdo — sem estilos por bloco).
- Múltiplas páginas-camadas persistidas no mesmo JSON `loja.experiencia` (documento v2), com migração automática do formato v1 (array plano).
- Navegação pública por abas (tabs) fixas sob o header em `/[slug]`, alternando a camada ativa (modelo app — renderiza somente a camada ativa).
- Preview ao vivo real (mesmo `Storefront`) dentro do builder, reativo ao rascunho local.
- Renderer da vitrine passa a exibir todas as 13 block types.
- Seleção de produtos no bloco `productCollection` religada (manual/automático/híbrido, ordem, filtro por categoria, limite) — `resolveProductSection` deixa de ser código morto.
- Reinclusão do `TemaForm` como aba "Aparência" em `/dashboard/aparencia`, carregando o tema persistido.

## Não-goal

- Vínculo de plano (ESSENCIAL/LIVRE) para limites de páginas — nenhum plano é persistido hoje; o builder segue com `plan='LIVRE'` default e o limite de páginas é apenas o teto do domínio (30).
- Estilos/visual por bloco (ex.: fundo, espaçamento, alinhamento por bloco) — fica para iteração futura.
- URLs individuais por página-camada (todas vivem em `/[slug]`).
- Migração de schema Prisma / nova tabela.

## Modelo de dados

Coluna única `loja.experiencia` (JSON), sem nova tabela. Formato v2:

```ts
{
  versao: 2,
  paginas: [
    { id: "home-1", rotulo: "Home", ordem: 0, blocos: BlocoExperiencia[] },
    { id: "sobre-1", rotulo: "Sobre", ordem: 1, blocos: [...] },
  ],
}
```

### `BlocoExperiencia`

```ts
type BlockType =
  | "hero" | "richText" | "imageText" | "productCollection"
  | "categoryCollection" | "about" | "banner" | "cta"
  | "testimonials" | "faq" | "gallery" | "spacer" | "divider";

interface BlocoExperiencia {
  id: string;
  type: BlockType;
  label: string;
  visible: boolean;
  props: unknown; // validado per-type por propSchema, chaves desconhecidas removidas, defaults aplicados
}
```

## Comportamento — Domínio (VO `Experiencia`)

- `deJson(null | undefined)` → `Experiencia.vazia()` (consumidores caem no `initialPages`).
- `deJson(array)` (legado v1) → migra para um documento v2 com uma única página "Home" contendo o array.
- `deJson({ versao: 2, paginas })` → valida. Qualquer outro formato → `ExperienciaInvalida`.
- Invariantes: 1–30 páginas; `rotulo` não-vazio ≤ 24 chars; cada página ≤ `MAX_BLOCOS_EXPERIENCIA` (100) blocos; cada bloco com `type` ∈ as 13 e `props` validado contra o `propSchema` do tipo.
- `paraJson()` → sempre v2.
- `getPaginas()`, `isEmpty()`, `equals()`.

## Comando / Actions

- `SalvarExperiencia.from({ lojaId, paginas })` — schema zod valida documento v2 (id/rotulo/ordem/blocos/props de cada bloco contra o schema do tipo).
- `carregarExperienciaAction() → { ok, paginas }` — retorna páginas persistidas ou `initialPages`.
- `salvarExperienciaAction(paginas)` — persiste documento v2; `revalidatePath("/dashboard/aparencia")` e `revalidatePath("/«slug»")`.
- Nova `carregarTemaAction() → { ok, tema }` — espelho do carregarExperiencia, retorna `TemaView` do tema persistido.

## Interfaces — UI

### Builder (`ExperienceBuilder`) — `/dashboard/aparencia`

- Seletor horizontal de páginas-camadas substituindo o badge "Página inicial": usa o mesmo `Tabs` da vitrine pública (`ui/tabs`), renderizado num painel do builder — estado único de camada ativa compartilhado entre lista de blocos, forms e preview. Selecionar um tab carrega os blocos da camada; renomear (label), adicionar (limite 30), remover (Home não removível; confirmação via `AlertDialog`).
- Contador "X/Y páginas · N/M blocos" refletindo a camada ativa e o teto do plano.
- Painel "Propriedades" vira formulário gerado por `propSchema` por tipo (`Field`/`FieldLabel`/`InputField`/`TextareaField`/`SwitchField`/`SelectField` multi-seleção para produtos/categorias/`UploadImagem` para imagens), puro (escreve em `props`), validação zod com `FieldError`; Publicar bloqueado se inválido.
- Rascunho local não persistido; "Publicar" persiste o documento inteiro (todas camadas).

### Preview ao vivo (`PreviewVitrine`)

- Renderiza o `Storefront` real com o rascunho local desnormalizado (blocos + tema em memória), reativo a cada edição; sem round-trip.
- `ExperienceRenderer` ganha flag `preview?: boolean` — blocos `visible:false` renderizam com `opacity-40 ring-1 ring-dashed` (somente em preview).
- Layout: painel lateral em desktop (`lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]`); em mobile vira overlay/Sheet acionado pelo botão "Preview". Toggles de device (Desktop/Tablet/Mobile).
- `useDeferredValue` para evitar travar com muitos blocos; preview só monta com o painel aberto.
- `onAdd` do carrinho desabilitado no preview.

### Vitrine pública (`Storefront`) — `/[slug]`

- Barra de abas fixa sob o header com os rótulos das camadas (`Tabs` dos `ui/`); estado client `paginaIdAtiva`, default primeira camada; renderiza somente a camada ativa.
- `Storefront` passa a receber `vitrine.paginas: { id, rotulo, blocos }[]` e renderiza `blocks={paginaAtiva.blocos}`.
- URL permanece `/[slug]`.

### Tema

- `/dashboard/aparencia` vira duas abas (`Tabs`): "Construtor" (default) e "Aparência".
- `TemaForm` (hoje órfão) volta a ser funcional como aba "Aparência": carrega tema persistido via `carregarTemaAction`, salva via `alterarTemaAction` (já existente), com preview próprio (o card existente no form).
- Sidebar segue apontando para `/dashboard/aparencia` — sem mudança.

### Renderer (`ExperienceRenderer`) — corrigir inacabados

Renderizar **todas as 13** block types; hoje `imageText`, `testimonials`, `faq`, `gallery` não renderizam nada. `productCollection` passa a usar `resolveProductSection` (manual/automático/híbrido, `order`, `categoryId`, `limit`) com os dados de `vitrine.produtos`. `categoryCollection` passa a usar o filtro de categoria. Bloco `preview` flag conforme acima.

## Estados e erro

- Construtor: loading (`Skeleton`/`Spinner`), erro ao carregar (`Alert` destrutivo + retry), rascunho vazio (empty state "Adicione seu primeiro bloco"), publicação com erro (`Alert` + reenable), sucesso (toast + badge).
- Camadas: remover com confirmação (`AlertDialog`), limite de páginas com `Alert` informativo.
- Form por bloco: `FieldError` inline; imagem com `UploadImagem` (loading/erro).
- Preview: vazio → `Empty`; tema não salvo → paleta default (Oceano).
- TemaForm: loading do tema (`Skeleton`), erro de save (`Alert`), sucesso (toast).

## Testes (vitest, padrão do repo)

- `tests/unit/vos/experiencia.test.ts` — `deJson` v1→v2; validação de página/bloco; `paraJson` v2; listas vazias; rótulo vazio; >30 páginas; props com chave desconhecida → removida + defaults aplicados.
- `tests/unit/application/loja-service.test.ts` (estender) — `SalvarExperiencia` persiste doc v2; `alterarExperiencia` com document válido e inválido.
- Sem testes de componente (padrão do repo: somente domínio/app).

## Arquivos afetados

**Create:**
- `src/components/features/aparencia/preview-vitrine.tsx`
- `src/components/features/aparencia/block-form.tsx`
- `src/app/actions/tema.ts`

**Modify:**
- `src/modules/loja/domain/vos/experiencia.ts` — documento v2 + propSchemas por tipo (fonte da verdade; `BlockType`/`BlocoExperiencia`/`PaginaExperiencia` movem para cá).
- `src/modules/loja/application/commands/salvar-experiencia.ts` — schema de páginas v2.
- `src/app/actions/experiencia.ts` — `paginas` + fallback `initialPages`.
- `src/components/features/aparencia/experience-builder.tsx` — camadas + forms + preview embed.
- `src/components/features/aparencia/tema-form.tsx` — carrega tema persistido.
- `src/components/features/vitrine/storefront.tsx` — tabs de camadas, recebe `paginas`.
- `src/components/features/vitrine/experience-renderer.tsx` — 13 block types + preview flag + resolveProductSection.
- `src/lib/vitrine-view.ts` — serializa `paginas` (+ `tema` já presente).
- `src/lib/experience.ts` — re-exporta do domínio; helpers de página (`initialPages`, `paginaInicial`).
- `src/app/dashboard/aparencia/page.tsx` — `Tabs` Construtor/Aparência.

## Dependências

Nenhuma nova: zod, react-hook-form + `zodResolver`, `@base-ui/react` primitives, `Tabs`/`Dialog`/`Sheet`/`AlertDialog` do `ui/`, `UploadImagem` — todos já instalados/confirmados.

## Critérios de qualidade

- Rodar `npm run typecheck`, `npm run lint`, `npm run test` e manter verde.
- Sem dead code (ex.: `resolveProductSection` passa a ser usado), sem exports não usados.
- Escopo respeitado: apenas arquivos listados/acima.