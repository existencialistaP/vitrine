# Spec — Vitrine pública: página de produto, erros, tema SSR-safe e carrinho persistente

**Data:** 2026-09-13 · **Status:** aguardando revisão · **Origem:** investigação de UX + brainstorming (sub-projeto A de 4)

---

## 1. Objetivo

Elevar a qualidade da vitrine pública — a única parte do produto que o consumidor final
vê — em quatro frentes aprovadas:

1. **Página de produto dedicada** (`/{slug}/produto/[id]`): o produto ganha URL própria
   (compartilhável no WhatsApp/Instagram, indexável), com foto grande, descrição completa
   e preço — hoje o visitante só vê nome + preço no card, sem descrição em lugar nenhum.
2. **Erros honestos**: separar "loja não existe" (404) de "sistema com falha" (erro) — hoje
   qualquer falha de servidor mascara-se como "vitrine não encontrada" (`[slug]/page.tsx:14-18`).
3. **Tema SSR-safe e completo**: cores da loja no primeiro byte (sem FOUC) e renderização
   das opções que o lojista configura no builder e a vitrine hoje ignora
   (`formatoCard`, `estilo`, `layout`).
4. **Carrinho persistente com feedback**: carrinho sobrevive a refresh/navegação
   (localStorage por loja) e adicionar item dá feedback visual imediato ("Adicionado ✓").

## 2. Escopo

- Rotas de `src/app/[slug]/` (vitrine e página de produto) e boundary global do app.
- Componentes de `src/components/features/vitrine/` (`storefront`, `experience-renderer`,
  `product-card`, `order-sheet`, `produto-detalhe` novo).
- Módulo de carrinho (`use-carrinho`) e tipo `ItemCarrinho` unificado.
- Correção do tratamento de erros em `[slug]/page.tsx` e na nova rota de produto.

## 3. Não-escopo (explícito)

- **`corSecundaria` sem uso visual** — segue persistida no tema, sem render (decisão Q4).
  Nada cria UI para ela nesta spec.
- **Busca, filtros e paginação na vitrine** — sem visitor search nesta fase.
- **Botões de categoria funcionais** (`experience-renderer.tsx:170-175`) — fica para o
  sub-projeto B/D; esta spec não os toca.
- **`next/image` / lazy-loading global de imagens** — polish transversal (sub-projeto D).
- **Metadata/OG por loja** (`generateMetadata`) — sub-projeto D. A rota de produto nasce
  sem OG próprio; o ganho de compartilhamento vem da URL dedicada.
- **Multibilidade de páginas via URL** (`?page=`) — as abas de páginas múltiplas seguem
  em estado client.
- **Preview do builder**: `PreviewVitrine` continua montando `VitrineView` client-side;
  nenhuma mudança de comportamento no builder (sub-projeto B trata o builder).
- **Pedido**: fluxo `formatarPedidoAction` → WhatsApp permanece idêntico; sem nome/telefone
  do cliente, sem entrega/retirada.
- **Domínio**: nenhum novo método em `catalogoService`, nenhum VOs novo, nenhuma migração
  de banco. O catálogo já traz todos os produtos no agregado.

## 4. Requisitos

### RF-A1 — Página de produto

- Rota `/{slug}/produto/[id]` (server component), acessível a partir dos cards da
  coleção de produtos, que se tornam clicáveis.
- Conteúdo essencial (decisão Q3): foto grande, nome, preço, descrição completa,
  botão "Adicionar ao pedido", link "← Voltar para {nome da loja}" no topo.
- A foto principal usa o `aspecto` do `formatoCard` e o card usa `classeEstiloCard`
  (consistência com a vitrine).
- Loja inexistente ou produto inexistente → `notFound()` (404). Falha de infraestrutura →
  erro propagado (RF-A5).
- Produtos sem imagem: placeholder com ícone (mesmo padrão do `ProductCard` atual).

### RF-A2 — Cards clicáveis na vitrine

- O card de produto da coleção (`productCollection`) linka para
  `/{slug}/produto/{id}` (link no card; o botão "Adicionar" **não** navega — continua
  adicionando ao carrinho).
- A coleção passa a usar o `ProductCard` existente (hoje código morto), eliminando o
  card inline duplicado do `experience-renderer.tsx:139-155`.
- `ProductCard` respeita `aspecto` (`formatoCard`), `classeEstiloCard` (`estilo`) e
  `horizontal` (layout Lista) — props que o componente já tem.
- Acessibilidade: nome do produto acessível no link (não só "ver produto"); botão
  "Adicionar" com `aria-label` incluindo o nome do produto.

### RF-A3 — Tema SSR-safe

- Cores da loja (`--vitrine-primary`, `--vitrine-secondary`, `--vitrine-bg`) aplicadas
  via `style` inline no wrapper da página — servidor e cliente no mesmo paint.
  Remover o `useEffect` que muta `document.documentElement` (`storefront.tsx:37-47`).
- As classes consumidoras (`bg-(--vitrine-bg)` etc.) permanecem; nada muda de contrato
  para o builder/preview.
- Mesmo tratamento na página de produto (inline style idêntico).

### RF-A4 — Opções de tema renderizadas

A vitrine passa a respeitar (helpers já existentes em `src/lib/visual/`):

| Opção | Origem | Efeito |
|---|---|---|
| `layout` | `classeLayout()` (`formatos.ts:88`) | Grade: densa (4 col), larga (3 col, cards maiores), lista (ProductCard horizontal, 1 coluna), destaque (primeiro card em largura total) |
| `formatoCard` | `obterFormatoCard().aspecto` (`formatos.ts:71`) | Proporção da imagem nos cards (square/3:4/4:3) |
| `estilo` | `classeEstiloCard()` (`estilos.ts:46`) | Cantos/sombra dos cards de produto |

- Aplicáveis onde há grade de produtos (coleções `productCollection`) e na página de
  produto (foto principal + card principal).
- `corSecundaria` e `paleta`/`fonte` seguem como hoje (fonte já aplicada; paleta resolve
  as três cores; secundária guardada).

### RF-A5 — Carrinho persistente

- Hook `useCarrinho(slug)` encapsula todo o estado do carrinho; consumido por
  `Storefront` e `ProdutoDetalhe`.
- Chave: `vitrine:carrinho:{slug}` — um carrinho por loja.
- Toda mutação (adicionar / alterar quantidade / limpar) espelha no `localStorage`.
- Estado inicial vazio; reidratação do `localStorage` apenas após o mount
  (sem mismatch de hidratação).
- Entrada inválida (JSON quebrado, itens sem campos esperados) → descartada
  silenciosamente, carrinho vazio. Falha de storage (quota, modo privado) nunca quebra
  a vitrine: estado em memória segue funcionando sem persistência.

### RF-A6 — Feedback "Adicionado ✓"

- Ao adicionar, o próprio botão troca para "Adicionado ✓" por ~1,5s e volta
  (estado `adicionadoId` + timer). Sem toast.
- O badge de contagem no header atualiza (hook compartilhado nas duas rotas).
- Mesmo comportamento na página de produto.

### RF-A7 — Erros da vitrine

- `[slug]/page.tsx`: capturar **apenas** `NotFoundError` (kernel,
  `src/kernel/errors/domain-error.ts:18` — classe base de `VitrineNaoEncontrada`) →
  `notFound()`. Qualquer outro erro **propaga**.
- Nova rota de produto: mesma regra. Produto inexistente dentro de loja existente →
  `notFound()`.
- Novo `src/app/[slug]/error.tsx`: padrão `ErrorState` (`patterns/error-state.tsx`) —
  "Não foi possível carregar esta vitrine agora" + "Tentar novamente" (`reset()`).
  Cobre vitrine e página de produto.
- Novo `src/app/error.tsx`: boundary global, mesmo padrão.
- `not-found.tsx` existente segue sem alteração (mensagem genérica cobre loja e produto).

## 5. Interfaces e componentes

### Novos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `src/app/[slug]/produto/[id]/page.tsx` | Server component: busca catálogo por slug, valida produto, serializa, renderiza `ProdutoDetalhe` |
| `src/components/features/vitrine/produto-detalhe.tsx` | Client: layout do detalhe (foto, nome, preço, descrição, adicionar, voltar) |
| `src/components/features/vitrine/use-carrinho.ts` | Hook do carrinho: estado + localStorage + feedback "Adicionado ✓" |
| `src/components/features/vitrine/vitrine-header.tsx` | Header extraído (logo, nome, botão pedido + badge) reusado pelas duas rotas |
| `src/app/[slug]/error.tsx` | Boundary de erro da sub-árvore `[slug]` |
| `src/app/error.tsx` | Boundary global |

### Modificados

| Arquivo | Mudança |
|---|---|
| `src/app/[slug]/page.tsx` | Catch restrito a `NotFoundError`; aplica tema inline no wrapper; usa `VitrineHeader` |
| `src/components/features/vitrine/storefront.tsx` | Remove `ItemCarrinho` e estado do carrinho (usa hook); remove `useEffect` de tema; usa `VitrineHeader` |
| `src/components/features/vitrine/experience-renderer.tsx` | Coleção de produtos usa `ProductCard` clicável com classeLayout/classeEstiloCard/aspecto; remove card inline |
| `src/components/features/vitrine/product-card.tsx` | Deixa de ser código morto: vira o card da coleção (ganha prop de link) |
| `src/components/features/vitrine/order-sheet.tsx` | Importa `ItemCarrinho` do módulo do carrinho (remove duplicata) |

### Contratos

- `useCarrinho(slug, { habilitado })` → `{ itens, totalItens, adicionar, alterarQuantidade,
  limpar, adicionadoId }`. `habilitado: false` (preview do builder) desliga persistência
  e reidratação — o preview nunca lê/escreve `localStorage`. Funções puras exportadas do
  mesmo módulo (`parseCarrinho`, reducer de mutação) são a fonte da lógica, testáveis
  sem DOM (ver §9).
- `ItemCarrinho` (fonte única, migrada de `storefront.tsx:15-21`):
  `{ id, nome, precoCents, precoFormatado, quantidade }`.
- `ProductCard` ganha prop opcional `href` (presença transforma o card em link; o botão
  "Adicionar" permanece botão — nunca link aninhado em link).

## 6. Modelo de dados

- **Persistência**: única chave `vitrine:carrinho:{slug}` com JSON
  `{ versao: 1, itens: ItemCarrinho[] }`. `versao` permite invalidação futura do formato
  sem migração — versão desconhecida → descarta.
- Nenhuma mudança em `prisma/schema.prisma`, em VOs ou no agregado `experience`.
  `serializeVitrineBase` já expõe tudo que a página de produto precisa
  (`vitrine-view.ts:39-72`) — sem alteração em `VitrineView`.

## 7. Edge cases

| Caso | Comportamento |
|---|---|
| Produto adicionado foi removido da loja entre a navegação e o finalizar | `formatarPedidoAction` valida via VOs; falha → erro genérico no sheet (comportamento atual mantido) |
| Carrinho salvo com produto que não existe mais | Item permanece no carrinho (nome/preço estão salvos); pedido é formado com o que o cliente escolheu — coerente com o modelo atual client-side |
| `localStorage` indisponível (quota/privado) | Carrinho funciona em memória; sem erro na UI |
| JSON corrompido / versão desconhecida | Descartado silenciosamente; carrinho vazio |
| Quantidade | Teto defensivo de 99 por item no cliente (o VO `Quantidade` não tem máximo — documentado, sem mudar o domínio nesta spec) |
| Produto sem imagem na página de detalhe | Placeholder com ícone `Store` (mesmo padrão do `ProductCard`) |
| Preview do builder (`preview: true`) | Sem persistência, sem reidratação, sem link para página de produto (cards não navegam no preview), sem botão de pedido no header (já é o comportamento) |
| Loja existe, produto não | `notFound()` → `not-found.tsx` genérico |
| Falha de infra no `listarPorSlug` | Propaga → `error.tsx` com "Tentar novamente" |
| Multiplos abas | Cada aba reidrata no mount; a última mutação vence (sem sync entre abas — aceitável, sem `storage` listener nesta fase) |

## 8. Acessibilidade

- Link do card com o nome do produto como conteúdo acessível (não "ver mais").
- `aria-label` no botão "Adicionar" incluindo o nome do produto
  (ex.: `Adicionar Bolo de Cenoura ao pedido`) — hoje N botões idênticos.
- Badge de contagem do carrinho: `aria-live="polite"` (ou texto acessível equivalente)
  para anunciar mudança de contagem.
- Breadcrumb "← Voltar" com `aria-label` claro; página de detalhe com `h1` único.
- Botão "Adicionado ✓": troca de rótulo percebida por leitores de tela (texto real, não
  só visual).

## 9. Estratégia de testes

O projeto não tem Testing Library nem setup de DOM no Vitest — a suíte atual cobre
domínio/aplicação. Portanto:

- **Unitários (Vitest, `tests/unit/`), sobre funções puras exportadas do módulo do
  carrinho** (o hook é uma casca fina sobre elas; as funções são extraídas exatamente
  para tornar isto testável):
  - `parseCarrinho` (validação do JSON salvo): entrada válida, JSON quebrado, versão
    desconhecida, itens sem campos → descarte silencioso.
  - Reducer de mutação: adicionar (incrementa), alterarQuantidade (0 remove item,
    teto 99), limpar.
  - Serialização/desserialização ida-e-volta preserva `ItemCarrinho`.
  - Página de produto: extraída a decisão de rota (loja/produto inexistente → 404;
    `NotFoundError` → 404; outro erro → propaga) em função pura, testada diretamente.
- **Critério de qualidade manual (PRINCIPLES §9)** — comportamento de UI sem cobertura
  automatizada nesta fase: FOUC eliminado (primeiro paint com cores da loja),
  layout/formato/estilo refletidos na vitrine, refresh mantém carrinho, card linka e
  botão adiciona sem navegar, "Adicionado ✓" aparece e expira, 404 vs erro
  distinguíveis, teclado/foco nas duas rotas.

## 10. Arquivos afetados (resumo)

`src/app/[slug]/page.tsx` (mod) · `src/app/[slug]/produto/[id]/page.tsx` (novo) ·
`src/app/[slug]/error.tsx` (novo) · `src/app/error.tsx` (novo) ·
`src/components/features/vitrine/{storefront,experience-renderer,product-card,order-sheet}.tsx`
(mod) · `produto-detalhe.tsx`, `use-carrinho.ts`, `vitrine-header.tsx` (novos) ·
`tests/unit/` (novos testes).

## 11. Dependências e ordem

1. **Base**: `use-carrinho` + tipo `ItemCarrinho` unificado (storefront e order-sheet migram).
2. **Tema SSR-safe** (inline style) + RF-A4 (opções na coleção e `ProductCard`).
3. **Rota de produto** (`produto-detalhe`, header extraído, links nos cards).
4. **Erros** (catch restrito + `error.tsx` da sub-árvore + global).

Sem dependências novas de pacote. Sem mudança de schema, de API pública do domínio ou
de contratos de server actions existentes.
