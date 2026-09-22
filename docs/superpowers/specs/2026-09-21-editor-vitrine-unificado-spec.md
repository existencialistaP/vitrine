# Spec — Editor da vitrine unificado (Conteúdo + Aparência) e prévia compartilhada

**Data:** 2026-09-21 · **Status:** aguardando revisão · **Origem:** investigação de UI/UX + performance do dashboard e brainstorming (sub-projeto do construtor de vitrine)

---

## 1. Objetivo

Unificar o construtor de vitrine (`Conteúdo`) e o editor de aparência (`Aparência`) numa única
superfície de edição, com **uma prévia real e persistente** compartilhada pelos dois modos. A
investigação mostrou que hoje são duas abas com prévias diferentes (uma real, uma mock hardcoded),
títulos duplicados, navegação de páginas aninhada, formulários com primitivas bespoke e
espaçamento empilhado. Além disso, o carregamento é feito no client depois do mount (waterfall) e
salvar a experiência reescreve todos os produtos/categorias (N+1 de upserts).

O resultado esperado: troca de modo **seamless** (a prévia não desmonta), opções de aparência
compreensíveis (presets por padrão, ajuste fino sob um toggle), layout que **aproveita o espaço sem
empilhar**, prévia com presets/redimensionar/tela cheia/ocultar, e gravação/leitura sem os gargalos
confirmados.

## 2. Escopo

- Rota `src/app/dashboard/aparencia/` e o shell do editor.
- `src/components/features/aparencia/` (`experience-builder`, `block-form`, `preview-vitrine`,
  `tema-form`).
- O componente de prévia compartilhada e o consumo de `src/components/features/vitrine/storefront`.
- Camada de leitura/gravação da experiência e do tema (server actions, serviço/repositório) no que
  diz respeito a prefetch e gravação focada.
- Nomenclatura da navegação para a área (sidebar/título/modos).

## 3. Não-escopo (explícito)

- Padronização do restante do dashboard (Visão geral, Produtos, Categorias, Configurações).
- **Drag-and-drop** de blocos (a reordenação continua por setas, com alternativa de teclado).
- Autosave ou rascunho persistido no servidor; `revalidateTag`/cache granular.
- Mudanças em `prisma/schema.prisma`, em VOs ou no agregado `Loja`/`Experiencia`.
- `next/image`/lazy-load global, redesign da vitrine pública, `generateMetadata`.
- Navegação de páginas por URL (`?page=`) e o gating de plano (`plan` hoje nunca é passado;
  permanece como está).
- Comportamento da vitrine pública (o `Storefront` só é consumido no modo `preview`).

## 4. Requisitos

### RF-1 — Editor único e nomenclatura

- A área continua na rota `/dashboard/aparencia`, mas passa a ser um **editor único** com dois
  **modos** no painel esquerdo: `Conteúdo` e `Aparência`. Não há abas de página aninhadas.
- Nomenclatura única: sidebar **"Vitrine"**, título da página **"Editor da vitrine"**, modos
  `Conteúdo` / `Aparência`.
- Remover o `PageHeader` duplicado da página e o `CardTitle`/descrição duplicados do builder; existe
  uma única barra de título do editor.

### RF-2 — Barra do editor

- No topo do editor existem: seletor de páginas (com renomear, remover quando aplicável e
  adicionar página), **indicador de alterações não salvas** e a **ação de salvar contextual ao
  modo** (`Conteúdo` → "Publicar"; `Aparência` → "Salvar").
- Limites de plano continuam respeitados (máx. de páginas/blocos e blocos avançados), com o
  feedback existente de bloqueio.

### RF-3 — Layout e espaçamento

- O editor ocupa a altura útil da viewport (`dvh`), com cabeçalho fixo e **cada painel com scroll
  próprio**. Não há empilhamento vertical de cards como hoje.
- Desktop: grid `[painel de edição | alça | prévia]`; a largura do painel é estável (~360–420px) e a
  prévia ocupa o restante.
- Espaçamento pelas escalas existentes (`gap-4`/`gap-6`, `p-4`/`p-6`), `flex + gap` (sem
  `space-y-*`), tokens semânticos de radius/tipografia (sem `rounded-[2px]`, `text-[10px]/[11px]`,
  `text-white`, `max-w-[...]` espalhado).

### RF-4 — Inspector adaptativo

- **Desktop (lg+):** coluna de propriedades **recolhível**, visível apenas com bloco selecionado;
  sem seleção, a prévia expande.
- **Tablet:** propriedades em **drawer sobre o painel**, com ação "voltar" para a lista.
- **Mobile:** propriedades em **acordeão inline** no próprio bloco da lista; não há coluna de
  prévia.
- No modo `Aparência` o mesmo slot de inspector mostra as **opções de tema** (sempre visíveis),
  não propriedades de bloco.

### RF-5 — Prévia compartilhada

- Um **único componente de prévia** é montado no shell do editor e **nunca desmonta** ao trocar de
  modo.
- A prévia renderiza o `Storefront` existente com `preview=true`, alimentado pelo **rascunho**
  (`paginas`, `tema`, `base`). Editar (inclusive tema não salvo) reflete na prévia imediatamente.
- O mock hardcoded de aparência ("Minha Loja") é removido.
- A navegação entre páginas na prévia usa o mesmo estado de página do editor (sem segundo conjunto
  de abas).
- A prévia não é interativa para pedido (sem carrinho/`OrderSheet`).

### RF-6 — Barra da prévia

- Controles: **presets de dispositivo** (mobile/tablet/desktop), **redimensionar por alça**,
  **tela cheia** (overlay) e **ocultar**.
- A **coluna de prévia** existe em desktop (lg+). Em tablet e mobile a prévia é acessada apenas em
  **tela cheia**; redimensionar é exclusivo do desktop, e ocultar/mostrar existe onde há coluna de
  prévia.
- Estado da prévia (dispositivo, largura, oculta) é **preferência de UI** e persiste localmente.
- Larguras de dispositivo ficam **centralizadas** numa configuração do componente (não espalhadas
  como valores arbitrários).

### RF-7 — Aparência: modo padrão (presets)

- Com o modo avançado **desligado** (padrão), o painel mostra uma grade de **temas prontos**.
- Cada preset aplica, num clique, `paleta + estilo + formatoCard + layout + fonte`. Aplicar reflete
  na prévia imediatamente.
- Os presets são uma constante de UI que **combina os catálogos existentes** de `src/lib/visual`
  (PALETAS, ESTILOS, FORMATOS_CARD, LAYOUTS, FONTES). Sem dado novo no domínio.
- O preset ativo é indicado visualmente; mudanças finas posteriores deixam de corresponder a um
  preset (estado "personalizado").

### RF-8 — Aparência: modo avançado

- Um **toggle booleano "Modo avançado"** por usuário. **Desligado** → presets (RF-7). **Ligado** →
  grupos em acordeão: **Cores, Estilo dos cards, Layout da grade, Tipografia, Marca e logo**.
- Cada grupo controla um item do tema (`paleta`, `estilo`, `formatoCard`, `layout`, `fonte`,
  `logoUrl`) para ajuste fino; a marca/logo usa o `UploadImagem` existente.
- O estado do toggle é preferência local, não estado da loja.
- O formulário usa `FieldGroup`/`Field`/`FieldLabel`/`Controller`; a seleção de opção usa um
  **único padrão de cartão-de-opção compartilhado** (hoje há `CartaoOpcao`, `CartaoPaleta`,
  `RadioFormato`, `DiagramaLayout` bespoke).

### RF-9 — Estado e alterações não salvas

- O editor mantém o rascunho `{ paginas, tema }` e sinaliza **sujeira por domínio** (`conteúdo` e
  `aparência` separadamente).
- Indicador único de "alterações não salvas" na barra do editor.
- Aviso (com confirmação) ao **trocar de modo**, sair do editor ou fechar a aba quando há
  alterações não salvas do domínio desligado/modo atual.
- Salvar um modo **limpa** a sujeira daquele domínio e não afeta o rascunho do outro.

### RF-10 — Persistência por modo

- `Conteúdo` → `salvarExperienciaAction` (command `SalvarExperiencia`); `Aparência` →
  `alterarTemaAction` (command `AlterarTema`). Ambos permanecem os comandos existentes.
- Após salvar, o editor **não** dispara `router.refresh()` (o rascunho já é o estado salvo); a rota
  pública da vitrine é revalidada.
- Sucesso via toast existente; erro de gravação em `Alert` inline com nova tentativa; durante a
  gravação o botão mostra `Spinner` e fica `disabled`.

### RF-11 — Prefetch no servidor

- `aparencia/page.tsx` passa a ser `async` e fornece o estado inicial (`paginas`, `base`, `tema`)
  como props ao editor. Reusa `getMinhaLoja()` (já cacheado por request e deduplicado com o layout)
  e o serviço de catálogo que hoje alimenta a base da prévia.
- As leituras de editor **não** podem mais ocorrer em `useEffect` pós-mount:
  `carregarExperienciaAction`, `carregarBasePreviewAction` e `carregarTemaAction` deixam de ser
  chamadas pelo editor. Se ficarem sem uso, podem ser removidas.

### RF-12 — Gravação focada (sem N+1)

- A gravação da **experiência** deve persistir apenas a coluna `experiencia` (com o lock otimista
  via `versao`), **sem** re-sincronizar produtos/categorias nem reescrever colunas de tema.
- A gravação do **tema** deve persistir apenas as colunas de tema (com o lock otimista), **sem**
  re-sincronizar produtos/categorias.
- O `save` geral do agregado (usado por produtos, categorias e dados da loja) **não muda**.
- Conflito de versão continua resultando em `DadosDesatualizados`.

### RF-13 — Acessibilidade

- A linha do bloco deixa de ser `role="button"` envolvendo botões: passa a **item de lista
  semântica** com controle de seleção próprio; botões de ação são irmãos, não aninhados.
- Presets de dispositivo com **rótulo acessível e `aria-pressed`**, dentro de grupo rotulado (hoje
  expõem as chaves cruas).
- Botões icon-only com `aria-label` e ícone `aria-hidden`; estratégia única de nome acessível.
- Foco visível em todos os controles; reordenação acessível por teclado; aviso de não salvo
  anunciável.

## 5. Interfaces e componentes

### Novos

| Arquivo | Responsabilidade |
|---|---|
| `src/components/features/aparencia/vitrine-editor.tsx` | Shell client do editor: rascunho, sujeira, modo, barra, layout e composição da prévia |
| `src/components/features/aparencia/preview-panel.tsx` | Prévia compartilhada persistente + barra (presets, alça, tela cheia, ocultar) |
| `src/components/features/aparencia/aparencia-panel.tsx` | Modo Aparência: presets (padrão) e grupos (avançado) |
| `src/components/features/aparencia/option-card.tsx` | Padrão único de cartão-de-opção selecionável (substitui bespoke) |
| `src/components/features/aparencia/use-editor-preferencias.ts` | Preferências de UI (modo avançado, dispositivo, largura, oculta) com persistência local |

### Modificados

| Arquivo | Mudança |
|---|---|
| `src/app/dashboard/aparencia/page.tsx` | Vira `async`, faz o prefetch e renderiza o shell do editor (sem abas de página duplicadas) |
| `src/components/features/aparencia/experience-builder.tsx` | Deixa de ser a página inteira; vira o painel de `Conteúdo` dentro do shell (rascunho vem por props) |
| `src/components/features/aparencia/block-form.tsx` | Remove anti-patterns de render (schema no render, `safeParse(watch())`, validação a cada tecla); passa a compor o inspector |
| `src/components/features/aparencia/preview-vitrine.tsx` | Substituído por `preview-panel.tsx` (persistente, com presets/resize/fullscreen/ocultar) |
| `src/components/features/aparencia/tema-form.tsx` | Substituído por `aparencia-panel.tsx` (presets + grupos, sem mock hardcoded) |
| `src/app/actions/experiencia.ts` | Preserva `salvarExperienciaAction`; remove/readapta a leitura pós-mount |
| `src/app/actions/tema.ts` | Preserva `alterarTemaAction`; remove/readapta a leitura pós-mount |
| `src/components/layout/app-sidebar.tsx` | Rótulo da área passa a "Vitrine" |
| `src/components/features/vitrine/storefront.tsx` (e filhos) | Ajustes de memoização/lazy para a prévia, sem mudar o comportamento público |
| `src/modules/loja/application/loja-service.ts` + repositório | Caminhos de gravação focada de experiência e tema (RF-12) |

### Contratos

- **Shell do editor (server → client).** Props iniciais: `paginas: PaginaExperiencia[]`,
  `base: VitrineBase`, `tema: TemaView` (e o `plan` quando existir). Sem carregamento client.
- **Rascunho.** `{ paginas, tema }` no client, com `tema` no formato `TemaView`. A prévia monta o
  `VitrineView` a partir de `base` + `paginas` + rascunho de `tema`, **recomputando as cores da
  paleta** via `lib/visual` (client-safe) sempre que a paleta mudar — o `base` traz as cores já
  resolvidas do servidor e ficaria defasado no preview de tema não salvo.
- **Sujeira.** `{ conteudo: boolean, aparencia: boolean }`, com operações de marcar/limpar por
  domínio e uma consulta agregada (`temAlteracoes`).
- **Gravação focada.** Operações de aplicação/repositório que atualizam somente as colunas do
  domínio e incrementam `versao` sob lock otimista; contrato inalterado de `DadosDesatualizados`
  em conflito.
- **Preferências de UI.** Chave local versionada; valores ausentes/ inválidos caem nos padrões
  (`modo avançado = off`, dispositivo = mobile, oculta = false).

## 6. Dados e estado

- **Sem mudança de schema, VOs ou agregado.** `Experiencia` e `IdentidadeVisual` continuam sendo a
  fonte dos dados persistidos; os presets são apenas combinações de catálogos de `lib/visual`.
- **Leitura:** uma única carga server-side monta o estado inicial; nenhuma leitura pós-mount.
- **Escrita:** experiência e tema são persistidos de forma independente e focada (RF-12).
- **Preferências de UI:** armazenamento local por navegador (não entram no domínio nem na loja).

## 7. Edge cases

| Caso | Comportamento |
|---|---|
| Lojista sem loja | `requireMinhaLoja()` redireciona para `/dashboard/onboarding` **fora** do `try` (corrige o redirect engolido atual) |
| Nenhum bloco selecionado (desktop) | Inspector vazio com dica; prévia ocupa o espaço liberado |
| Página única | Ação de remover página desabilitada |
| Bloco oculto | Prévia mostra o placeholder de bloco oculto (comportamento existente) |
| Sem produtos/categorias | Prévia usa os estados vazios existentes do `Storefront` |
| Conflito de versão ao salvar (outra aba) | Erro claro (`DadosDesatualizados`) com orientação para recarregar; rascunho preservado |
| Falha ao salvar um modo | Só aquele domínio permanece sujo; o outro não é afetado |
| Trocar de modo com alterações pendentes | Confirmação antes de descartar/trocar |
| Sair/fechar com alterações pendentes | Aviso nativo + confirmação in-app |
| Modo avançado ligado e preset não corresponde mais | Estado "personalizado" (nenhum preset marcado) |
| Preferências de UI indisponíveis (quota/privado) | Editor funciona com padrões em memória, sem erro |
| Catálogo grande | Prévia limita a renderização pelo `limit` do bloco; payload da base é carregado uma vez no server |
| Prévia em mobile | Acessível apenas via tela cheia |

## 8. Acessibilidade

- Lista de blocos como lista semântica; seleção separada das ações.
- Presets de dispositivo e opções de aparência com rótulo + estado (`aria-pressed`), em grupos
  rotulados.
- Botões icon-only com `aria-label`; ícones `aria-hidden`.
- Foco visível, ordem de tabulação coerente, sem controles aninhados em botão.
- Aviso de alterações não salvas perceptível por leitor de tela.

## 9. Estratégia de testes

O projeto não tem Testing Library/DOM no Vitest (cobre domínio/aplicação e funções puras), então:

- **Unitários (Vitest, `tests/unit/`):**
  - catálogo de presets → tema resultante (paleta/estilo/formato/layout/fonte) e detecção de
    "personalizado";
  - reducer de rascunho/sujeira: marcar/limpar por domínio, `temAlteracoes`, independência entre
    domínios;
  - config de dispositivos da prévia e resolução de preferências com valores ausentes/inválidos;
  - guarda de descarte (trocar modo/sair com pendências).
- **Aplicação (`tests/unit/application/`, com `tests/helpers/in-memory-loja-repository.ts`):**
  - gravação de experiência atualiza apenas `experiencia` e incrementa `versao`;
  - gravação de tema atualiza apenas as colunas de tema;
  - conflito de versão → `DadosDesatualizados`; produtos/categorias permanecem intactos.
- **Critério de qualidade manual (PRINCIPLES §9):** prévia não desmonta ao trocar de modo; preset
  aplica na hora; presets/alça/tela cheia/ocultar; inspector adaptativo nos três breakpoints;
  espaçamento e tokens; fluxo de não salvo; teclado e foco.

## 10. Arquivos afetados (resumo)

`src/app/dashboard/aparencia/page.tsx` (mod) ·
`src/components/features/aparencia/{vitrine-editor,preview-panel,aparencia-panel,option-card,use-editor-preferencias}.tsx`
(novos) · `src/components/features/aparencia/{experience-builder,block-form,preview-vitrine,tema-form}.tsx`
(mod/substituídos) · `src/app/actions/{experiencia,tema}.ts` (mod) ·
`src/components/layout/app-sidebar.tsx` (mod) ·
`src/components/features/vitrine/*` (ajustes de memo/lazy) ·
`src/modules/loja/application/loja-service.ts` + repositório Prisma (mod) ·
`tests/unit/` (novos).

## 11. Dependências e ordem

1. **Base de dados/aplicação (RF-11, RF-12):** prefetch server-side e caminhos de gravação focada,
   com testes de aplicação — habilita o resto sem waterfall nem N+1.
2. **Shell do editor (RF-1, RF-2, RF-3, RF-5, RF-6, RF-9, RF-10):** rascunho, modos, layout,
   barra e prévia persistente.
3. **Painel de Conteúdo (RF-4):** lista de blocos, inspector adaptativo e limpeza dos anti-patterns
   do `block-form`.
4. **Aparência (RF-7, RF-8):** presets + modo avançado sobre o painel padrão.
5. **Acessibilidade (RF-13)** transversal, revisada ao final.

Sem dependências novas de pacote. Sem mudança de schema, de API pública do domínio ou de contratos
externos de server actions.
