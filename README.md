<div align="center">

# 🛍️ Vitrine

**Sua loja online em minutos — com a identidade da sua marca e pedidos direto no WhatsApp.**

Next.js 16 · Supabase · Prisma · Tailwind v4 · shadcn/ui

</div>

---

## ✨ Visão geral

A **Vitrine** ajuda pequenos negócios a montar uma loja digital com identidade própria:

- 🏪 **Onboarding guiado** — crie sua vitrine em poucos passos (nome, slug, WhatsApp, descrição).
- 🎨 **Identidade visual** — combos predefinidos de paleta, fonte, layout e formato de card (sem CSS manual).
- 📦 **Catálogo completo** — produtos, categorias com ordenação e controle de disponibilidade.
- 💬 **Pedidos direto no WhatsApp** — o cliente vê sua vitrine e finaliza por mensagem.
- 🔐 **Autenticação Supabase** — sessão segura por lojista.

Rotas públicas (`/[slug]`, `pricing`, `faq`) versus painel protegido em `/dashboard`.

---

## 🧱 Stack

| Camada        | Tecnologia                                          |
| ------------- | --------------------------------------------------- |
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| **Banco**     | Postgres via [Prisma](https://www.prisma.io) + [Supabase](https://supabase.com) |
| **Auth**      | [Supabase Auth](https://supabase.com)               |
| **UI**        | [shadcn/ui](https://ui.shadcn.com) (primitives `@base-ui/react`) + Tailwind v4 |
| **Forms**     | react-hook-form + zod                               |
| **Qualidade**  | TypeScript, ESLint, Vitest                           |

---

## 🚀 Começando

### Pré-requisitos

- Node.js 20+
- npm
- Um projeto no [Supabase](https://supabase.com) (banco + auth)

### 1. Instale as dependências

```bash
npm install
```

> O `postinstall` já roda `prisma generate`.

### 2. Configure as variáveis de ambiente

Crie `.env.local` na raiz com:

| Variável | Descrição |
| -------- | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL pública do projeto Supabase (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publicável (publishable) do Supabase |
| `DATABASE_URL` | Connection string do Postgres (transação / adapter-pg) |
| `DIRECT_URL` | Connection string direta (migrations) |

Exemplo de `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
DATABASE_URL="postgresql://postgres.<ref>:<password>@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.<ref>:<password>@db.<ref>.supabase.co:5432/postgres"
```

### 3. Modele o banco e rode

```bash
npm run prisma:push      # aplica o schema (usuarios, lojas, categorias, produtos)
npm run prisma:generate  # gera o client Prisma local (opcional, rodado no postinstall)
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Comando                | Descrição                              |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Servidor de desenvolvimento            |
| `npm run build`        | Build de produção                      |
| `npm run start`        | Serve o build de produção              |
| `npm run typecheck`    | Checagem de tipos (`tsc --noEmit`)     |
| `npm run lint`         | Lint (ESLint)                          |
| `npm run test`         | Testes unitários (Vitest)              |
| `npm run test:watch`   | Testes em modo watch                   |
| `npm run prisma:push`  | Aplica o schema ao banco               |
| `npm run prisma:generate` | Gera o client Prisma local          |
| `npm run db:seed`      | Roda o seed de demonstração            |
| `npm run registry:build` | Regenera o registry `@vitrine` em `public/r` |

---

## 🎨 Design System

Antes de criar qualquer interface, consulte:

- `docs/design/PRINCIPLES.md` — **fonte de verdade** do design.
- `.agents/skills/shadcn/SKILL.md` — skill de UI do shadcn.

Princípios-chave:

- **Tokens, nunca valores arbitrários.** Sem `bg-[#172033]` nem `rounded-[13px]`; use tokens oklch sem `dark:` manual.
- **Composição > duplicação** — primitives em `src/components/ui`, estados em `patterns`, domínio em `features`.
- **Forms** com react-hook-form + zod + `FieldGroup`/`Field` (nunca `div space-y` + `useState`).
- **Ícones**: `data-icon="inline-start/inline-end"` em botões; `InputGroup` + `InputGroupAddon` em inputs.
- **Acessibilidade e responsivo**: mobile-first, foco visível, `aria-label`, `DialogTitle`/`SheetTitle` sempre.
- **Registry próprio `@vitrine`** (`registry.json` → `public/r`): consumível via `npx shadcn search @vitrine` / `npx shadcn add @vitrine/<item>`.

---

## 📁 Estrutura (resumo)

```
src/
├─ app/                 # Rotas (App Router) — públicas, auth, dashboard
├─ components/          # ui | layout | patterns | features
├─ modules/             # Domínio (lojista, loja, catalogo, pedido)
│   ├─ domain/          # Agregados, VOs, eventos, interfaces de repositório
│   ├─ application/     # Casos de uso + validação (Zod)
│   └─ infrastructure/  # Repositórios Prisma
├─ infrastructure/      # DI, Prisma, eventos
├─ kernel/              # VOs e IDs compartilhados
└─ lib/                 # supabase, auth, helpers
```

---

## 🧑‍💻 Desenvolvimento

- Lint e tipos antes de subir: `npm run lint && npm run typecheck`.
- Testes: `npm test` (Vitest).
- Qualquer mudança de banco: edite `prisma/schema.prisma` e rode `npm run prisma:push`.

---

## 📄 Licença

Privado — uso interno.