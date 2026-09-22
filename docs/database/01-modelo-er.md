# 1. Modelo Entidade-Relacionamento (ER físico)

> Fonte: `prisma/schema.prisma` · PostgreSQL (Supabase) · DDL do Prisma Migrate.

## 1.1 Diagrama ER completo

```mermaid
erDiagram
    USUARIOS {
        text id PK "UUID v4 gerado na aplicação"
        text authUserId UK "id em auth.users (Supabase Auth); nulo até o vínculo"
        text nome
        text email UK "e-mail de login/contato"
        text telefone "opcional"
        timestamp criadoEm "DEFAULT CURRENT_TIMESTAMP"
    }

    LOJAS {
        text id PK "UUID v4 gerado na aplicação"
        text lojistaId FK,UK "dono da vitrine (1:1)"
        text nome
        text slug UK "identificador amigável de URL"
        text descricao "opcional"
        text whatsapp "número que recebe os pedidos"
        StatusLoja status "DEFAULT ATIVA"
        text temaPaleta "DEFAULT OCEANO"
        text temaEstilo "DEFAULT CLASSICO"
        text temaFormatoCard "DEFAULT QUADRADO"
        text temaLayout "DEFAULT GRADE_DENSA"
        text temaFonte "DEFAULT SANS"
        text temaLogoUrl "opcional"
        jsonb experiencia "página em blocos (documento v2)"
        int versao "lock otimista, DEFAULT 1"
        timestamp criadoEm "DEFAULT CURRENT_TIMESTAMP"
        timestamp atualizadoEm "gerenciado por @updatedAt"
    }

    CATEGORIAS {
        text id PK "UUID v4"
        text lojaId FK
        text nome "único por loja"
        int ordem "DEFAULT 0"
    }

    PRODUTOS {
        text id PK "UUID v4"
        text lojaId FK
        text categoriaId FK "opcional"
        text nome
        text descricao "opcional"
        int precoCents "valor em centavos, DEFAULT 0"
        text imagemUrl "opcional"
        boolean disponivel "DEFAULT true"
        int ordem "DEFAULT 0"
        timestamp criadoEm "DEFAULT CURRENT_TIMESTAMP"
        timestamp atualizadoEm "gerenciado por @updatedAt"
    }

    USUARIOS ||--o| LOJAS : "possui vitrine"
    LOJAS ||--o{ CATEGORIAS : "agrupa"
    LOJAS ||--o{ PRODUTOS : "vende"
    CATEGORIAS o|--o{ PRODUTOS : "classifica"
```

## 1.2 Diagrama lógico (somente chaves)

```mermaid
erDiagram
    USUARIOS {
        text id PK
        text authUserId UK
    }
    LOJAS {
        text id PK
        text lojistaId FK,UK
        text slug UK
    }
    CATEGORIAS {
        text id PK
        text lojaId FK
    }
    PRODUTOS {
        text id PK
        text lojaId FK
        text categoriaId FK
    }

    USUARIOS ||--o| LOJAS : "1:1"
    LOJAS ||--o{ CATEGORIAS : "1:N"
    LOJAS ||--o{ PRODUTOS : "1:N"
    CATEGORIAS o|--o{ PRODUTOS : "0..1:N"
```

## 1.3 Relacionamentos e integridade referencial

| # | Origem | Destino | Cardinalidade | Coluna(s) | Regra |
| --- | --- | --- | --- | --- | --- |
| R1 | `usuarios` | `lojas` | 1 : 0..1 | `lojas.lojistaId` → `usuarios.id` | `ON DELETE CASCADE`, `ON UPDATE CASCADE`, `UNIQUE` |
| R2 | `lojas` | `categorias` | 1 : 0..N | `categorias.lojaId` → `lojas.id` | `ON DELETE CASCADE`, `ON UPDATE CASCADE` |
| R3 | `lojas` | `produtos` | 1 : 0..N | `produtos.lojaId` → `lojas.id` | `ON DELETE CASCADE`, `ON UPDATE CASCADE` |
| R4 | `categorias` | `produtos` | 0..1 : 0..N | `produtos.categoriaId` → `categorias.id` | `ON DELETE SET NULL`, `ON UPDATE CASCADE`, anulável |

### Leitura das cardinalidades

- **R1 — `||--o|`**: cada usuário tem no máximo **uma** vitrine (garantido pelo
  `UNIQUE` em `lojas.lojistaId`); toda loja pertence a exatamente um usuário.
- **R2 / R3 — `||--o{`**: uma loja pode ter **zero ou muitas** categorias/produtos;
  cada linha pertence a exatamente uma loja.
- **R4 — `o|--o{`**: um produto pode não ter categoria (`NULL`) e uma categoria
  pode não ter produtos.

### Diagrama textual

```text
usuarios ──1───0..1── lojas ──1───0..N── categorias
                        │                   │
                        │                   │ 0..1
                        └──1───0..N── produtos ┘
```

## 1.4 Chaves e índices

| Tabela | Chave primária | Únicos | Índices adicionais |
| --- | --- | --- | --- |
| `usuarios` | `usuarios_pkey (id)` | `usuarios_authUserId_key`, `usuarios_email_key` | — |
| `lojas` | `lojas_pkey (id)` | `lojas_lojistaId_key`, `lojas_slug_key` | `lojas_lojistaId_idx`, `lojas_slug_idx` |
| `categorias` | `categorias_pkey (id)` | `categorias_lojaId_nome_key (lojaId, nome)` | `categorias_lojaId_idx` |
| `produtos` | `produtos_pkey (id)` | — | `produtos_lojaId_idx`, `produtos_categoriaId_idx` |

> Observação: em `lojas`, os índices `lojas_lojistaId_idx` e `lojas_slug_idx` são
> redundantes com os índices únicos correspondentes (o PostgreSQL já indexa as
> colunas únicas). Não causam erro, apenas duplicam a estrutura de índice.

## 1.5 Diagrama ER gerado pelo Prisma (uma linha por modelo)

```mermaid
erDiagram
    "Usuario" ||--o| "Loja" : "lojistaId"
    "Loja" ||--o{ "Produto" : "produtos"
    "Loja" ||--o{ "Categoria" : "categorias"
    "Categoria" o|--o{ "Produto" : "produtos"
```

Esse formato (nomes de **modelo Prisma**, sem colunas) pode ser regenerado
automaticamente com a ferramenta `prisma-markdown` — ver
[`05-schema-prisma.md`](./05-schema-prisma.md).
