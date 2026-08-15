# Vitrine

Vitrine digital para pequenos negócios: crie sua loja online com a identidade da sua marca e receba pedidos direto no WhatsApp.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [Prisma](https://www.prisma.io) + Postgres (Supabase)
- [Supabase Auth](https://supabase.com) — login e sessão
- [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4
- TypeScript, Vitest

## Começando

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente copiando o schema e preenchendo os valores:

   ```bash
   cp .env.example .env.local
   ```

   Você precisa de: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `DATABASE_URL` e `DIRECT_URL`.

3. Gere o client Prisma e rode o servidor de desenvolvimento:

   ```bash
   npm run prisma:generate
   npm run dev
   ```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando                | Descrição                              |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento            |
| `npm run build`        | Build de produção                      |
| `npm run typecheck`    | Checagem de tipos (tsc)                |
| `npm run lint`         | Lint (ESLint)                          |
| `npm run test`         | Testes (Vitest)                        |
| `npm run prisma:push`  | Aplica o schema ao banco               |
| `npm run prisma:generate` | Gera o client Prisma local         |
| `npm run registry:build` | Regenera o registry `@vitrine` em `public/r` |

## Design System

Consulte `docs/design/PRINCIPLES.md` (fonte de verdade) e o skill `shadcn` em
`.agents/skills/shadcn/SKILL.md` antes de criar qualquer interface.

- **Tokens**: definidos em `src/app/globals.css` (oklch, claro + escuro). Não
  usar valores arbitrários (`bg-[#...]`, `rounded-[13px]`).
- **Componentes**: `src/components/ui` (primitives), `layout` (estruturas),
  `patterns` (estados recorrentes), `features` (domínio).
- **Forms**: react-hook-form + zod + `FieldGroup`/`Field`.
- **Registry próprio `@vitrine`**: `registry.json` na raiz; build em `public/r`
  (regenerar com `npm run registry:build`). Após push, é consumível via
  `npx shadcn search @vitrine` / `npx shadcn add @vitrine/<item>`.
- **MCPs**: shadcn (local) e 21st.dev (remoto) em `opencode.json`. O 21st
  precisa de `API_KEY_21ST` (veja `.env.example`).
