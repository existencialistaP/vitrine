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
