import { z } from 'zod'

export const blockTypes = [
  'hero',
  'richText',
  'imageText',
  'productCollection',
  'categoryCollection',
  'about',
  'banner',
  'cta',
  'testimonials',
  'faq',
  'gallery',
  'spacer',
  'divider',
] as const

export type BlockType = (typeof blockTypes)[number]
export type StorePlan = 'ESSENCIAL' | 'LIVRE'

export const blockSchema = z.object({
  id: z.string(),
  type: z.enum(blockTypes),
  label: z.string(),
  visible: z.boolean(),
  props: z.record(z.string(), z.unknown()),
})

export type ExperienceBlock = z.infer<typeof blockSchema>

export const initialBlocks: ExperienceBlock[] = [
  { id: 'hero-1', type: 'hero', label: 'Apresentação da marca', visible: true, props: { title: 'Sua marca, do seu jeito', description: 'Conte a história e mostre o que torna sua loja especial.', action: 'Ver produtos' } },
  { id: 'categories-1', type: 'categoryCollection', label: 'Categorias em destaque', visible: true, props: { title: 'Explore por categoria', limit: 6 } },
  { id: 'products-1', type: 'productCollection', label: 'Produtos em destaque', visible: true, props: { title: 'Mais pedidos', mode: 'hybrid', limit: 8, order: 'manual' } },
  { id: 'about-1', type: 'about', label: 'Sobre a marca', visible: true, props: { title: 'Feito para fazer parte da sua rotina', body: 'Apresente sua história, seus valores e o cuidado por trás de cada produto.' } },
]

export const blockCatalog: { type: BlockType; label: string; description: string; plan: StorePlan }[] = [
  { type: 'hero', label: 'Hero', description: 'Apresentação com chamada principal e CTA.', plan: 'ESSENCIAL' },
  { type: 'richText', label: 'Texto editorial', description: 'Conteúdo rico para páginas e histórias.', plan: 'ESSENCIAL' },
  { type: 'imageText', label: 'Imagem + texto', description: 'Combine narrativa e imagem em uma seção.', plan: 'ESSENCIAL' },
  { type: 'productCollection', label: 'Coleção de produtos', description: 'Produtos por seleção, filtros ou ambos.', plan: 'ESSENCIAL' },
  { type: 'categoryCollection', label: 'Categorias', description: 'Navegação visual pelas categorias.', plan: 'ESSENCIAL' },
  { type: 'about', label: 'Sobre nós', description: 'Página editorial com valores e história.', plan: 'ESSENCIAL' },
  { type: 'banner', label: 'Banner promocional', description: 'Destaque para campanhas e novidades.', plan: 'LIVRE' },
  { type: 'cta', label: 'Chamada para ação', description: 'Direcione o visitante para uma ação.', plan: 'LIVRE' },
  { type: 'testimonials', label: 'Depoimentos', description: 'Prova social com clientes.', plan: 'LIVRE' },
  { type: 'faq', label: 'Perguntas frequentes', description: 'Responda dúvidas antes da compra.', plan: 'LIVRE' },
  { type: 'gallery', label: 'Galeria', description: 'Mostre produtos e bastidores.', plan: 'LIVRE' },
  { type: 'spacer', label: 'Espaçador', description: 'Controle o ritmo vertical da página.', plan: 'LIVRE' },
  { type: 'divider', label: 'Divisor', description: 'Separe grupos de conteúdo.', plan: 'LIVRE' },
]

export const planCapabilities: Record<StorePlan, { maxPages: number; maxBlocks: number; advanced: boolean; automaticRules: boolean }> = {
  ESSENCIAL: { maxPages: 3, maxBlocks: 12, advanced: false, automaticRules: true },
  LIVRE: { maxPages: 30, maxBlocks: 100, advanced: true, automaticRules: true },
}

export function moveBlock(blocks: ExperienceBlock[], id: string, direction: -1 | 1) {
  const index = blocks.findIndex((block) => block.id === id)
  const nextIndex = index + direction
  if (index < 0 || nextIndex < 0 || nextIndex >= blocks.length) return blocks
  const next = [...blocks]
  const [item] = next.splice(index, 1)
  next.splice(nextIndex, 0, item)
  return next
}

export function duplicateBlock(blocks: ExperienceBlock[], id: string) {
  const index = blocks.findIndex((block) => block.id === id)
  if (index < 0) return blocks
  const source = blocks[index]
  const copy = { ...source, id: `${source.type}-${Date.now()}`, label: `${source.label} (cópia)`, props: { ...source.props } }
  return [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)]
}

export function resolveProductSection(products: Array<{ id: string; nome: string; precoCents: number; categoriaId: string | null; disponivel?: boolean; criadoEm?: string }>, props: Record<string, unknown>) {
  const manualIds = Array.isArray(props.manualIds) ? props.manualIds.filter((id): id is string => typeof id === 'string') : []
  const categoryId = typeof props.categoryId === 'string' ? props.categoryId : null
  const limit = typeof props.limit === 'number' ? Math.max(1, Math.min(props.limit, 50)) : 8
  const order = props.order
  const eligible = products.filter((product) => product.disponivel !== false && (!categoryId || product.categoriaId === categoryId))
  const manual = manualIds.map((id) => eligible.find((product) => product.id === id)).filter(Boolean)
  const automatic = eligible.filter((product) => !manualIds.includes(product.id)).sort((a, b) => {
    if (order === 'priceAsc') return a.precoCents - b.precoCents
    if (order === 'priceDesc') return b.precoCents - a.precoCents
    if (order === 'name') return a.nome.localeCompare(b.nome)
    return (b.criadoEm ?? '').localeCompare(a.criadoEm ?? '')
  })
  return [...manual, ...automatic].slice(0, limit)
}

export function blockTypeLabel(type: BlockType) {
  return blockCatalog.find((block) => block.type === type)?.label ?? type
}

export function createBlock(type: BlockType): ExperienceBlock {
  return { id: `${type}-${Date.now()}`, type, label: blockTypeLabel(type), visible: true, props: {} }
}

export function pageTemplates() {
  return [
    { id: 'catalog', label: 'Home de catálogo', description: 'Hero, categorias, produtos e CTA.', blocks: initialBlocks },
    { id: 'about', label: 'Sobre nós', description: 'Uma página para história e valores.', blocks: [initialBlocks[0], initialBlocks[3]] },
    { id: 'promotion', label: 'Landing promocional', description: 'Banner, coleção filtrada e CTA.', blocks: [createBlock('banner'), initialBlocks[2], createBlock('cta')] },
  ]
}
