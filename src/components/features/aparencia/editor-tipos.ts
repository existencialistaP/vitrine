/** Modos do editor unificado. */
export type ModoEditor = 'conteudo' | 'aparencia'

/** Sinalização de alterações não salvas por domínio. */
export type SujeiraEditor = Record<ModoEditor, boolean>
