import type {
  Estilo,
  FormatoCard,
  Layout,
  Paleta,
} from '@/modules/loja/domain/vos/identidade-visual'
import type { Fonte } from '@/modules/loja/domain/vos/fonte'

/**
 * Seleção de tema por ids do domínio. Os tipos de união impedem ids
 * inexistentes em tempo de compilação.
 */
export type TemaSelecao = {
  paleta: Paleta
  estilo: Estilo
  formatoCard: FormatoCard
  layout: Layout
  fonte: Fonte
}

export type PresetAparencia = {
  id: string
  nome: string
  descricao: string
  tema: TemaSelecao
}

/** Combos prontos (RF-7) usando ids do domínio; a validade é garantida pelos tipos e pelo teste de pertencimento aos catálogos de `lib/visual`. */
export const PRESETS_APARENCIA: readonly PresetAparencia[] = [
  {
    id: 'oceano-classico',
    nome: 'Oceano clássico',
    descricao: 'Azul confiável, grade densa e leitura neutra.',
    tema: { paleta: 'OCEANO', estilo: 'CLASSICO', formatoCard: 'QUADRADO', layout: 'GRADE_DENSA', fonte: 'SANS' },
  },
  {
    id: 'esmeralda-moderno',
    nome: 'Esmeralda moderno',
    descricao: 'Verde acolhedor com cartões grandes e respiro.',
    tema: { paleta: 'ESMERALDA', estilo: 'MODERNO', formatoCard: 'QUADRADO', layout: 'GRADE_LARGA', fonte: 'MANROPE' },
  },
  {
    id: 'blush-minimal',
    nome: 'Blush minimal',
    descricao: 'Rosa delicado, lista enxuta e visual limpo.',
    tema: { paleta: 'BLUSH', estilo: 'MINIMAL', formatoCard: 'PANORAMICO', layout: 'LISTA', fonte: 'SANS' },
  },
  {
    id: 'terra-vibrante',
    nome: 'Terra vibrante',
    descricao: 'Terracota quente com retratos e personalidade.',
    tema: { paleta: 'TERRA', estilo: 'VIBRANTE', formatoCard: 'RETRATO', layout: 'GRADE_DENSA', fonte: 'SERIF' },
  },
  {
    id: 'lilas-moderno',
    nome: 'Lilás moderno',
    descricao: 'Violeta criativo com título em destaque.',
    tema: { paleta: 'LILAS', estilo: 'MODERNO', formatoCard: 'QUADRADO', layout: 'GRADE_LARGA', fonte: 'DISPLAY' },
  },
  {
    id: 'carvao-minimal',
    nome: 'Carvão minimal',
    descricao: 'Preto elegante com primeiro produto em destaque.',
    tema: { paleta: 'CARVAO', estilo: 'MINIMAL', formatoCard: 'RETRATO', layout: 'DESTAQUE', fonte: 'MONO' },
  },
]

export function presetParaTema(preset: PresetAparencia): TemaSelecao {
  return { ...preset.tema }
}

export function encontrarPreset(tema: TemaSelecao): PresetAparencia | null {
  return (
    PRESETS_APARENCIA.find(
      (preset) =>
        preset.tema.paleta === tema.paleta &&
        preset.tema.estilo === tema.estilo &&
        preset.tema.formatoCard === tema.formatoCard &&
        preset.tema.layout === tema.layout &&
        preset.tema.fonte === tema.fonte
    ) ?? null
  )
}
