# 2. Diagrama de Classes (domínio DDD)

> Fonte: `src/kernel/ddd` e `src/modules/*/domain` · padrão DDD (agregados,
> entidades, value objects, eventos de domínio).

## 2.1 Abstrações do kernel (shared kernel)

```mermaid
classDiagram
    direction LR

    class DomainObject {
        <<interface>>
    }
    class ValueObject {
        <<interface>>
        +equals(other) boolean
    }
    class IdentifiableDomainObject~ID~ {
        <<interface>>
        +getId() ID
    }
    class ConcurrentDomainObject {
        <<interface>>
        +getVersion() number
        +bumpVersion() void
    }
    class DomainObjectId {
        <<abstract>>
        -uuid : string
        +toUUID() string
        +equals(other) boolean
    }
    class Entity~ID~ {
        <<abstract>>
        -id : ID
        -version : number
        +getId() ID
        +getVersion() number
        +bumpVersion() void
        +equals(other) boolean
    }
    class AggregateRoot~ID~ {
        <<abstract>>
        -domainEvents : DomainEvent[]
        #registerEvent(event) void
        +getRegisteredEvents() DomainEvent[]
        +pullDomainEvents() DomainEvent[]
    }

    ValueObject ..|> DomainObject
    DomainObjectId ..|> DomainObject
    Entity ..|> IdentifiableDomainObject
    Entity ..|> ConcurrentDomainObject
    AggregateRoot --|> Entity
    Entity ..> DomainObjectId : "id"
```

## 2.2 Agregados e entidades

> `Lojista` e `Loja` são **raízes de agregado**. `Produto` e `Categoria` são
> entidades **internas** ao agregado `Loja` — nunca acessadas diretamente.

```mermaid
classDiagram
    direction LR

    class AggregateRoot~ID~ {
        <<abstract>>
        #registerEvent(event) void
        +pullDomainEvents() DomainEvent[]
    }
    class Entity~ID~ {
        <<abstract>>
        +getId() ID
        +bumpVersion() void
    }

    class Lojista {
        -authUserId : AuthUserId
        -nome : NomeLojista
        -email : Email
        -telefone : Telefone
        +cadastrar(params)$ Lojista
        +reconstruir(params)$ Lojista
        +vincularAutenticacao(authUserId) void
        +alterarPerfil(params) void
    }

    class Loja {
        -lojistaId : LojistaId
        -nome : NomeLoja
        -slug : Slug
        -descricao : Descricao
        -whatsapp : Whatsapp
        -status : StatusLoja
        -tema : IdentidadeVisual
        -experiencia : Experiencia
        -produtos : Produto[]
        -categorias : Categoria[]
        +criar(params)$ Loja
        +reconstruir(params)$ Loja
        +adicionarProduto(produto) void
        +atualizarProduto(id, alteracoes) void
        +alterarDisponibilidade(id, disp) void
        +removerProduto(id) void
        +adicionarCategoria(categoria) void
        +renomearCategoria(id, nome) void
        +reposicionarCategoria(id, ordem) void
        +removerCategoria(id) void
        +alterarDados(params) void
        +alterarTema(tema) void
        +alterarExperiencia(experiencia) void
        +ativar() void
        +inativar() void
    }

    class Produto {
        -nome : NomeProduto
        -descricao : Descricao
        -preco : Preco
        -categoriaId : CategoriaId
        -imagemUrl : Url
        -disponibilidade : DisponibilidadeValue
        -ordem : Ordem
        +of(params)$ Produto
        +alterarDados(params) void
        +alterarDisponibilidade(disp) void
        +reposicionar(ordem) void
    }

    class Categoria {
        -nome : NomeCategoria
        -ordem : Ordem
        +of(params)$ Categoria
        +renomear(nome) void
        +reposicionar(ordem) void
    }

    Lojista --|> AggregateRoot
    Loja --|> AggregateRoot
    Produto --|> Entity
    Categoria --|> Entity

    Lojista "1" --> "0..1" Loja : "possui"
    Loja "1" *-- "0..*" Produto : "contém"
    Loja "1" *-- "0..*" Categoria : "contém"
    Produto "0..*" --> "0..1" Categoria : "categoriaId"
```

## 2.3 Value Objects por agregado

```mermaid
classDiagram
    direction LR

    class ValueObject {
        <<interface>>
        +equals(other) boolean
    }

    class Lojista
    class Loja
    class Produto
    class Categoria

    class NomeLojista
    class AuthUserId
    class Email
    class Telefone

    class NomeLoja
    class Slug
    class Descricao
    class Whatsapp
    class IdentidadeVisual
    class Experiencia

    class NomeProduto
    class Preco
    class DisponibilidadeValue
    class Ordem
    class Url

    class NomeCategoria

    Lojista --> NomeLojista
    Lojista --> AuthUserId
    Lojista --> Email
    Lojista --> Telefone

    Loja --> NomeLoja
    Loja --> Slug
    Loja --> Descricao
    Loja --> Whatsapp
    Loja --> IdentidadeVisual
    Loja --> Experiencia

    Produto --> NomeProduto
    Produto --> Descricao
    Produto --> Preco
    Produto --> DisponibilidadeValue
    Produto --> Ordem
    Produto --> Url

    Categoria --> NomeCategoria
    Categoria --> Ordem

    NomeLojista ..|> ValueObject
    AuthUserId ..|> ValueObject
    Email ..|> ValueObject
    Telefone ..|> ValueObject
    NomeLoja ..|> ValueObject
    Slug ..|> ValueObject
    Descricao ..|> ValueObject
    Whatsapp ..|> ValueObject
    IdentidadeVisual ..|> ValueObject
    Experiencia ..|> ValueObject
    NomeProduto ..|> ValueObject
    Preco ..|> ValueObject
    DisponibilidadeValue ..|> ValueObject
    Ordem ..|> ValueObject
    Url ..|> ValueObject
    NomeCategoria ..|> ValueObject
```

### `IdentidadeVisual` (objeto de valor composto)

```mermaid
classDiagram
    direction LR

    class IdentidadeVisual {
        -paleta : Paleta
        -estilo : Estilo
        -formatoCard : FormatoCard
        -layout : Layout
        -fonte : Fonte
        -logoUrl : Url
        +padrao()$ IdentidadeVisual
        +of(params)$ IdentidadeVisual
        +withPaleta(p) IdentidadeVisual
        +withEstilo(e) IdentidadeVisual
        +withFormatoCard(f) IdentidadeVisual
        +withLayout(l) IdentidadeVisual
        +withFonte(f) IdentidadeVisual
        +withLogoUrl(u) IdentidadeVisual
    }
    class Paleta["«enum» Paleta"]
    class Estilo["«enum» Estilo"]
    class FormatoCard["«enum» FormatoCard"]
    class Layout["«enum» Layout"]
    class Fonte["«enum» Fonte"]
    class Url

    IdentidadeVisual --> Paleta
    IdentidadeVisual --> Estilo
    IdentidadeVisual --> FormatoCard
    IdentidadeVisual --> Layout
    IdentidadeVisual --> Fonte
    IdentidadeVisual --> Url
```

### `Experiencia` (objeto de valor composto — documento JSON)

```mermaid
classDiagram
    direction LR

    class Experiencia {
        -paginas : PaginaExperiencia[]
        +vazia()$ Experiencia
        +dePaginas(paginas)$ Experiencia
        +deJson(valor)$ Experiencia
        +paraJson() Object
        +getPaginas() PaginaExperiencia[]
        +isEmpty() boolean
    }
    class PaginaExperiencia {
        <<interface>>
        +id : string
        +rotulo : string
        +ordem : number
        +blocos : BlocoExperiencia[]
    }
    class BlocoExperiencia {
        <<interface>>
        +id : string
        +type : BlockType
        +label : string
        +visible : boolean
        +props : Record
    }
    class BlockType {
        <<enumeration>>
        hero
        richText
        imageText
        productCollection
        categoryCollection
        about
        banner
        cta
        testimonials
        faq
        gallery
        spacer
        divider
    }

    Experiencia "1" *-- "0..30" PaginaExperiencia
    PaginaExperiencia "1" *-- "0..100" BlocoExperiencia
    BlocoExperiencia --> BlockType
```

## 2.4 Eventos de domínio

```mermaid
classDiagram
    direction LR

    class DomainEvent {
        <<interface>>
        +occurredOn : Date
    }
    class AggregateRoot {
        <<abstract>>
        +pullDomainEvents() DomainEvent[]
    }
    class EventBus {
        <<interface>>
        +publish(events) void
    }
    class InMemoryEventBus

    class LojistaCadastrado
    class LojaCriada
    class ProdutoAdicionado
    class ProdutoAtualizado
    class ProdutoRemovido
    class TemaAlterado

    LojistaCadastrado ..|> DomainEvent
    LojaCriada ..|> DomainEvent
    ProdutoAdicionado ..|> DomainEvent
    ProdutoAtualizado ..|> DomainEvent
    ProdutoRemovido ..|> DomainEvent
    TemaAlterado ..|> DomainEvent

    InMemoryEventBus ..|> EventBus
    EventBus ..> DomainEvent : publica
    AggregateRoot ..> DomainEvent : "registra / drena"
    LojistaCadastrado ..> AggregateRoot
    LojaCriada ..> AggregateRoot
```

## 2.5 Mapeamento domínio ↔ banco de dados

| Conceito de domínio | Representação persistida |
| --- | --- |
| `Lojista` (raiz de agregado) | tabela `usuarios` |
| `Loja` (raiz de agregado) | tabela `lojas` |
| `Produto` (entidade) | tabela `produtos` |
| `Categoria` (entidade) | tabela `categorias` |
| `DomainObjectId` | coluna `id` (`TEXT`, UUID v4) |
| `versao` / `@Version` (`ConcurrentDomainObject`) | `lojas.versao` (lock otimista) |
| `Email`, `Telefone`, `NomeLojista`, `AuthUserId` | `usuarios.email`, `.telefone`, `.nome`, `.authUserId` |
| `NomeLoja`, `Slug`, `Descricao`, `Whatsapp` | `lojas.nome`, `.slug`, `.descricao`, `.whatsapp` |
| `IdentidadeVisual` (VO composto) | colunas `lojas.temaPaleta`, `temaEstilo`, `temaFormatoCard`, `temaLayout`, `temaFonte`, `temaLogoUrl` (achatado) |
| `Experiencia` (VO composto) | `lojas.experiencia` (`JSONB`, documento versão 2) |
| `StatusLoja` | enum PostgreSQL `"StatusLoja"` |
| `NomeProduto`, `Preco`, `DisponibilidadeValue`, `Url`, `Ordem` | `produtos.nome`, `.precoCents`, `.disponivel`, `.imagemUrl`, `.ordem` |
| `NomeCategoria`, `Ordem` | `categorias.nome`, `.ordem` |

> O módulo `pedido` (`ItemPedido`, `PedidoFormatado`, `Quantidade`) **não possui
> tabela**: ele monta o texto do pedido e o link `wa.me` em memória.
