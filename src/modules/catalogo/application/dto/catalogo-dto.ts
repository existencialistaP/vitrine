import type { LojaId } from "@/kernel/ids/loja-id";
import type { ProdutoId } from "@/kernel/ids/produto-id";
import type { CategoriaId } from "@/kernel/ids/categoria-id";
import type { NomeLoja } from "@/modules/loja/domain/vos/nome-loja";
import type { NomeProduto } from "@/modules/loja/domain/vos/nome-produto";
import type { NomeCategoria } from "@/modules/loja/domain/vos/nome-categoria";
import type { Descricao } from "@/modules/loja/domain/vos/descricao";
import type { Slug } from "@/modules/loja/domain/vos/slug";
import type { Whatsapp } from "@/modules/loja/domain/vos/whatsapp";
import type { IdentidadeVisual } from "@/modules/loja/domain/vos/identidade-visual";
import type { Preco } from "@/modules/loja/domain/vos/preco";
import type { Ordem } from "@/modules/loja/domain/vos/ordem";
import type { Url } from "@/modules/loja/domain/vos/url";
import type { Experiencia } from "@/modules/loja/domain/vos/experiencia";

/** Produto exibido no catálogo público (somente disponíveis). */
export interface ProdutoCatalogo {
  readonly produtoId: ProdutoId;
  readonly nome: NomeProduto;
  readonly descricao: Descricao;
  readonly preco: Preco;
  readonly imagemUrl: Url | null;
  readonly categoriaId: CategoriaId | null;
  readonly ordem: Ordem;
}

/** Categoria exibida no catálogo público. */
export interface CategoriaCatalogo {
  readonly categoriaId: CategoriaId;
  readonly nome: NomeCategoria;
  readonly ordem: Ordem;
}

/** Vitrine pública (read-model) com identidade visual e produtos disponíveis. */
export interface VitrineCatalogo {
  readonly lojaId: LojaId;
  readonly nome: NomeLoja;
  readonly slug: Slug;
  readonly descricao: Descricao;
  readonly whatsapp: Whatsapp;
  readonly tema: IdentidadeVisual;
  readonly experiencia: Experiencia;
  readonly categorias: readonly CategoriaCatalogo[];
  readonly produtos: readonly ProdutoCatalogo[];
}
