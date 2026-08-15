<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Vitrine — Regras para agentes de código

Este projeto segue um **design system explícito**. Consulte
`docs/design/PRINCIPLES.md` (fonte de verdade) e o skill `shadcn` instalado em
`.agents/skills/shadcn/SKILL.md` antes de criar qualquer interface.

Stack: Next.js 16 (App Router) · Tailwind v4 · shadcn/ui `base-nova`
(primitives `@base-ui/react`, **não Radix**) · lucide-react · react-hook-form +
zod · npm (não use pnpm).

## Pesquisar antes de criar (ordem obrigatória)

1. Procurar no projeto (`src/components/` — ui, layout, patterns, features).
2. Procurar no registry do projeto (`@vitrine`, via `npx shadcn search`).
3. Procurar no shadcn (`npx shadcn search @shadcn`).
4. Consultar referências externas (21st.dev) e adaptar.
5. Somente então implementar componente novo.

Use o MCP do shadcn para pesquisar, visualizar e instalar componentes
(workflow: `search` → `view` → `docs` → `add`).

## Regras de UI

1. **Não inventar primitives.** Se existir `Button`/`Input`/`Card`/`Field`
   equivalente, usar. Nunca criar `CustomButton`, `CustomModal`, etc.
2. **Composição > duplicação.** Compor `<Card><CardHeader/><CardContent/>`
   em vez de criar outro card equivalente.
3. **Tokens, nunca valores arbitrários.** Sem `bg-[#172033]`,
   `rounded-[13px]`, `px-[19px]`, cores raw (`text-blue-500`). Usar tokens
   semânticos (`bg-primary`, `text-muted-foreground`, `rounded-lg`).
4. **Sem `dark:` manual.** Os tokens oklch já respondem ao tema.
5. **Forms:** `FieldGroup` + `Field` + `FieldLabel` + `FieldError` +
   react-hook-form + `zodResolver` + `Controller`. Nunca `div` com `space-y-*`
   e `useState` manual para campos.
6. **Ícones:** em botões `data-icon="inline-start"/"inline-end"` (sem `size-*`);
   em inputs `InputGroup` + `InputGroupAddon` (nunca `div relative` + ícone
   absoluto).
7. **Loading em botão:** `Spinner` + `data-icon` + `disabled`.
8. **Estados:** toda interface relevante considera default, hover, focus,
   active, disabled, loading, error, empty, success (`Skeleton`, `Empty`,
   `Alert`).
9. **Responsividade mobile-first:** mobile, tablet, desktop, wide.
10. **Acessibilidade:** HTML semântico, teclado, focus visível, `aria-label`,
    `aria-invalid` + `data-invalid`, `DialogTitle`/`SheetTitle` sempre.
11. **Animações funcionais:** só para comunicar estado/hierarquia.
12. **Sem `space-x-*`/`space-y-*`:** usar `flex` + `gap-*`. Dimensões iguais:
    `size-*`.

## Workflow para nova tela

1. **Entender** — objetivo, usuários, ação principal, informações
   prioritárias, estados, componentes existentes.
2. **Pesquisar** — projeto → registry → shadcn → 21st.dev.
3. **Arquitetar** — estrutura da página, layout, componentes, responsivo,
   estados.
4. **Implementar** — com componentes existentes.
5. **Revisar** — espaçamento, alinhamento, tipografia, hierarquia, responsivo,
   acessibilidade, consistência, estados.
6. **Refinar** — corrigir apenas os problemas identificados.

## Verificação

- `npm run typecheck`
- `npm run lint`
- `npm run build` só indica que compila — a tela só está pronta após o critério
  de qualidade de `docs/design/PRINCIPLES.md` §9.
