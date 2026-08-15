# Vitrine — Design System

Fonte de verdade para a UI do produto. O agente de código e os desenvolvedores
devem consultar este documento **antes** de escrever qualquer interface.

Produto: vitrine digital para pequenos negócios. Crie a loja online com a
identidade da marca e receba pedidos no WhatsApp.

Stack: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui (style `base-nova`, primitives `@base-ui/react`) · lucide-react ·
react-hook-form + zod.

---

## 1. Princípios de design

- **Clean** — sem ruído visual; cada elemento tem um motivo.
- **Modern** — raios consistentes, bordas sutis, sombras mínimas.
- **Restrained** — cores da marca concentradas em `primary`/`secondary`;
  neutros dominam o restante.
- **Alta densidade de informação** — telas de gestão aproveitam o espaço sem
  encher de espaçamento desnecessário.
- **Bordas sutis** — `ring-1 ring-foreground/10` / `border-border`, nunca
  bordas pretas fortes.
- **Radius consistente** — usar os tokens `--radius-*`, nunca valores livres.
- **Tipografia forte** — hierarquia clara: `font-heading` para títulos,
  `text-muted-foreground` para secundário.
- **Animações funcionais** — só quando comunicam estado ou hierarquia
  (loading, foco, abrir/fechar overlays).

### Filosofia

O design system **cresce com o produto**. Componentes novos só entram quando
nenhum existente resolve o problema. Reutilizar > criar.

---

## 2. Design tokens

Definidos em `src/app/globals.css` (claro + escuro, oklch). **Não criar
valores arbitrários** (`bg-[#172033]`, `rounded-[13px]`, `px-[19px]`).

### Cores semânticas

`background` `foreground` `card` `popover` `primary` `secondary` `muted`
`accent` `destructive` `success` `border` `input` `ring` `chart-1..5` `sidebar*`

Regras:

- Usar sempre `text-primary`, `bg-muted`, `text-muted-foreground`, etc.
- Não usar cores raw (`text-blue-500`, `bg-gray-200`).
- `dark:` manual é desnecessário — os tokens já respondem ao tema.

### Tipografia

- `--font-sans` (Inter) para texto; `--font-heading` para títulos.
- Escala: `text-xs` `text-sm` (padrão) `text-base` `text-lg` `text-xl`
  `text-2xl` `text-3xl` `text-4xl` `text-5xl`.
- Títulos usam `font-heading` e `tracking-tight`.

### Radius

`--radius` base (0.625rem). Derivados: `rounded-sm/md/lg/xl/2xl/3xl/4xl`.
Componentes shadcn já usam o token correto — não sobrescrever.

### Espacamento

Tailwind v4 `--spacing`. Usar a escala padrão (`gap-2`, `gap-4`, `p-6`, `px-8`).

### Sombras

Sombra padrão dos componentes (overlays/`shadow-md`). Evitar sombras
customizadas inline.

---

## 3. Componentes

Níveis em `src/components/`:

```
ui/        primitives shadcn (button, input, field, card, ...)
layout/    estruturas compartilhadas (navbar, sidebar, page-header, shell)
patterns/  padrões recorrentes (empty-state, loading-state, error-state)
features/  componentes de domínio (auth/*, dashboard/*)
```

### Inventário atual — ui/

`button` `input` `label` `card` `field` `input-group` `select` `textarea`
`tabs` `switch` `avatar` `table` `badge` `separator` `dropdown-menu` `sheet`
`tooltip` `checkbox` `dialog` `skeleton` `alert-dialog` `alert` `breadcrumb`
`pagination` `toggle` `toggle-group` `spinner` `empty` `toast` `sonner`

**Antes de criar algo, procurar neste inventário e em registries.**

### Regras de composição (shadcn skill)

- Forms: `FieldGroup` + `Field` + `FieldLabel` + `FieldError` + `Controller`.
- Ícones em inputs: `InputGroup` + `InputGroupAddon`. Nunca `div relative` +
  ícone absoluto.
- Ícones em botões: `data-icon="inline-start"` / `"inline-end"`. Sem
  `size-4` no ícone.
- Loading em botão: `Spinner` + `data-icon` + `disabled`. Sem `isPending`.
- Sem `space-x-*` / `space-y-*` — usar `flex` + `gap-*`.
- Dimensões iguais: `size-*`, não `w-* h-*`.
- `Separator` em vez de `<hr>`; `Badge` em vez de span custom;
  `Skeleton` em vez de `animate-pulse`; `Empty` para vazio; `Alert` para callout.
- Toast (Base UI): `toast.add({ title, description, type })` — o `Toaster` já
  está montado no layout raiz.
- Dialog/Sheet sempre com `Title` (pode ser `sr-only`).
- Variantes existentes antes de estilos custom: `variant="outline"`,
  `size="sm"`, `text-muted-foreground`, `bg-muted`, etc.

---

## 4. Padrões

### Page header

```
breadcrumb (opcional)
title
description
actions (alinhados à direita)
```

### Empty state

`Empty` + `EmptyHeader` + `EmptyMedia` + `EmptyTitle` + `EmptyDescription` +
`EmptyContent` (icon, título, descrição, ações).

### Form

`Card` > `CardHeader/CardTitle/CardDescription` > `form` >
`FieldGroup` > `Field` (+ `FieldLabel`, `FieldError`) > `CardFooter` com ações.

Schema `zod` no mesmo arquivo ou em `lib/validations`. `useForm` +
`zodResolver` + `Controller`.

### Settings

`AppHeader` + `PageHeader` + `Tabs` (Perfil / Senha / Notificações).
Cada aba é um `Card` com `CardHeader/CardTitle/CardDescription` +
`FieldGroup` de forms; ações no `CardFooter`. Feedback de sucesso via
`toast.add({ type: 'success' })`, erro via `Alert` destrutivo.

### Painel (dashboard)

`SidebarProvider` + `AppSidebar` + `SidebarInset` em `app/dashboard/layout.tsx`.
Cada página tem `PageHeader` (título, descrição, ações) + conteúdo.
O sidebar agrupa: Visão geral, Produtos, Categorias, Aparência, Configurações
e um atalho "Ver vitrine". Em mobile, vira `Sheet`.

### Onboarding

Página única (`/dashboard/onboarding`) exibida quando o lojista não tem vitrine.
Form com validação de slug em tempo real (`verificarSlugAction`) e CTAs da
landing apontando para cá após login.

### CRUD

`page-header` → search + filters → `Table` → `Pagination` → estados
`loading` (`Skeleton`) / `error` (`Alert`) / `empty` (`Empty`).

---

## 5. Responsividade

Toda tela é pensada para mobile, tablet, desktop e wide.

- Começar mobile-first.
- Grids colapsam com `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- Navegação lateral vira `Sheet` em mobile.
- `Field orientation="responsive"` quando aplicável.

## 6. Estados

Interfaces interativas consideram: `default` `hover` `focus` `active`
`disabled` `loading` `error` `empty` `success`.

## 7. Acessibilidade

HTML semântico, navegação por teclado, focus visível, `aria-label`,
`aria-invalid` + `data-invalid` em forms, contraste AA, dialogs acessíveis.

## 8. Animações

Somente para comunicar estado ou hierarquia. Sem animação decorativa.

---

## 9. Critério de qualidade

Uma tela só está pronta quando passa em:

- **Functional** — funciona, dados corretos, estados tratados.
- **Visual** — hierarquia, espaçamento, tipografia, alinhamento consistentes.
- **Responsive** — mobile, tablet, desktop.
- **Accessibility** — teclado, foco, labels, contraste, semântica.
- **Consistency** — usa componentes existentes, respeita tokens, não cria
  padrões visuais isolados.

Não basta `npm run build` passar.
