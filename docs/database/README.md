# Banco de Dados — Vitrine

Documentação do modelo de dados do **Vitrine** (TCC): modelo entidade-relacionamento
físico, diagrama de classes do domínio (DDD) e dicionário de dados.

## Stack e fonte de verdade

| Item | Definição |
| --- | --- |
| SGBD | PostgreSQL (Supabase) |
| Schema | `prisma/schema.prisma` (Prisma ORM 7) |
| Migração | `prisma db push` — não há pasta `migrations` versionada |
| Storage de imagens | Supabase Storage, bucket `vitrine-imagens` (`supabase/storage.sql`) |
| Camada de domínio | TypeScript com DDD (`src/kernel/ddd`, `src/modules/*/domain`) |

> Os diagramas abaixo foram derivados do **DDL real** emitido pelo Prisma Migrate
> (`npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script`),
> não de suposições. Tipos, nulabilidade, defaults e constraints refletem o banco
> que o `db push` cria no PostgreSQL.

## Visão geral do modelo

| Tabela física | Modelo Prisma | Classe de domínio | Papel |
| --- | --- | --- | --- |
| `usuarios` | `Usuario` | `Lojista` (raiz de agregado) | Identidade do lojista e vínculo com o Supabase Auth |
| `lojas` | `Loja` | `Loja` (raiz de agregado) | Vitrine: dados públicos, identidade visual e página em blocos |
| `categorias` | `Categoria` | `Categoria` (entidade) | Agrupador de produtos, único por loja |
| `produtos` | `Produto` | `Produto` (entidade) | Item do catálogo da vitrine |

> Atenção ao mapeamento: o modelo Prisma chama-se `Usuario`, mas a classe de
> domínio correspondente é `Lojista`. A tabela `lojas` é o **agregado central**;
> `categorias` e `produtos` só existem dentro dela.

## Relacionamentos (resumo)

| Origem | Destino | Cardinalidade | Coluna | Integridade referencial |
| --- | --- | --- | --- | --- |
| `usuarios` | `lojas` | 1 → 0..1 | `lojas.lojistaId` | `ON DELETE CASCADE` / `ON UPDATE CASCADE` |
| `lojas` | `categorias` | 1 → 0..N | `categorias.lojaId` | `ON DELETE CASCADE` / `ON UPDATE CASCADE` |
| `lojas` | `produtos` | 1 → 0..N | `produtos.lojaId` | `ON DELETE CASCADE` / `ON UPDATE CASCADE` |
| `categorias` | `produtos` | 0..1 → 0..N | `produtos.categoriaId` | `ON DELETE SET NULL` / `ON UPDATE CASCADE` |

## Índice dos artefatos

| Arquivo | Conteúdo |
| --- | --- |
| [`01-modelo-er.md`](./01-modelo-er.md) | Diagrama ER físico completo (Mermaid) e diagrama lógico |
| [`02-diagrama-de-classes.md`](./02-diagrama-de-classes.md) | Diagrama de classes do domínio (DDD), value objects e eventos |
| [`03-tabelas/`](./03-tabelas/) | Um diagrama + dicionário de dados por tabela |
| [`03-tabelas/usuarios.md`](./03-tabelas/usuarios.md) | Tabela `usuarios` |
| [`03-tabelas/lojas.md`](./03-tabelas/lojas.md) | Tabela `lojas` |
| [`03-tabelas/categorias.md`](./03-tabelas/categorias.md) | Tabela `categorias` |
| [`03-tabelas/produtos.md`](./03-tabelas/produtos.md) | Tabela `produtos` |
| [`04-enums-e-storage.md`](./04-enums-e-storage.md) | Enum `StatusLoja`, enums de aplicação e bucket de Storage |
| [`05-schema-prisma.md`](./05-schema-prisma.md) | Documentação no estilo `prisma-markdown` (ERD + tabelas por modelo) |
| [`drawio/vitrine-er.drawio`](./drawio/vitrine-er.drawio) | draw.io editável — ER completo + uma página por tabela |
| [`drawio/vitrine-classes.drawio`](./drawio/vitrine-classes.drawio) | draw.io editável — diagrama de classes DDD |
| [`diagramas/`](./diagramas/) | Imagens prontas (`.svg` vetorial e `.png`) de todos os diagramas |

## Imagens prontas para o TCC (PNG/SVG)

Todos os diagramas foram renderizados em **SVG** (vetorial, melhor para impressão)
e **PNG** (raster, 2× de resolução). É só arrastar para o Word/LaTeX.

| Arquivo | Diagrama |
| --- | --- |
| `01-modelo-er-completo` | ER físico completo (4 tabelas) |
| `01-modelo-er-logico` | ER lógico (somente chaves) |
| `01-modelo-er-prisma` | ER por modelos Prisma |
| `02-classes-kernel-ddd` | Classes base do kernel (DDD) |
| `02-classes-agregados` | Agregados `Lojista`/`Loja` e entidades |
| `02-classes-value-objects` | Value objects por agregado |
| `02-classes-identidade-visual` | Value object `IdentidadeVisual` |
| `02-classes-experiencia` | Value object `Experiencia` (blocos) |
| `02-classes-eventos` | Eventos de domínio |
| `03-tabela-usuarios` | Diagrama da tabela `usuarios` |
| `03-tabela-lojas` | Diagrama da tabela `lojas` |
| `03-tabela-categorias` | Diagrama da tabela `categorias` |
| `03-tabela-produtos` | Diagrama da tabela `produtos` |
| `04-enum-status-loja` | Enum `StatusLoja` |
| `04-enums-aplicacao` | Enums de aplicação (tema, fonte, layout…) |
| `04-storage` | Fluxo do Supabase Storage |
| `05-erd-prisma-markdown` | ERD no formato `prisma-markdown` |

## Como renderizar e exportar

**Mermaid** (arquivos `.md`):

- GitHub / GitLab / Notion exibem os blocos ` ```mermaid ` nativamente.
- VS Code: extensão *Markdown Preview Mermaid Support*.
- Sem editor: cole o bloco em <https://mermaid.live> e exporte PNG/SVG.
- Para o TCC (Word/LaTeX): exporte em **PNG** (raster) ou **SVG** (vetor, melhor qualidade).

**draw.io** (arquivos `.drawio`):

- Abra <https://app.diagrams.net> → *File → Open from → Device* → selecione o arquivo.
- O `vitrine-er.drawio` tem **5 páginas**: ER completo + uma por tabela.
- Exporte em *File → Export as → PNG/SVG/PDF*.

**Imagens prontas**: a pasta [`diagramas/`](./diagramas/) já contém os 17 diagramas
em `.svg` e `.png`, prontos para inserir no TCC (dispensa renderizar).

**prisma-markdown** (documentação automática a partir do schema):

```bash
npx prisma-markdown
# requer configuração "prisma-markdown" no package.json
```

## Decisões de modelagem

- **IDs são `TEXT`, não `uuid` nativo.** O `@default(uuid())` do Prisma gera o UUID
  na aplicação; o DDL não cria `DEFAULT` nem o tipo `uuid` na coluna.
- **Timestamps são `TIMESTAMP(3)` sem timezone**, no padrão do Prisma para `DateTime`.
- **`atualizadoEm` é gerenciado pelo Prisma** (`@updatedAt`), não por trigger.
- **Lock otimista** em `lojas.versao` (`@Version`), espelhando o controle de
  concorrência do domínio (`ConcurrentDomainObject`).
- **`experiencia` é `JSONB`** e guarda o documento de páginas em blocos (versão 2),
  validado por schema Zod no domínio.
- **Tema é achatado em colunas `tema*`** (padrão `@Embedded` do JPA), em vez de
  tabela própria: são enums de aplicação persistidos como `TEXT`.
- **`categorias` tem `@@unique([lojaId, nome])`** — não é possível repetir o nome
  de categoria dentro da mesma vitrine.
- **`produtos.categoriaId` é anulável com `ON DELETE SET NULL`** — excluir uma
  categoria desvincula os produtos, sem apagá-los.
- **Pedidos não são persistidos**: o módulo `pedido` apenas formata o pedido e
  gera o link `wa.me` (integração via WhatsApp), sem tabela no banco.
