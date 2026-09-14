import type { CSSProperties } from 'react'

import { obterFonte } from '@/lib/visual'
import type { VitrineView } from '@/lib/vitrine-view'

/** Estilo inline com as CSS vars do tema — SSR-safe, sem useEffect (spec RF-A3). */
export function estiloTema(tema: VitrineView['tema']): CSSProperties {
  return {
    fontFamily: obterFonte(tema.fonte).css,
    '--vitrine-primary': tema.corPrimaria,
    '--vitrine-secondary': tema.corSecundaria,
    '--vitrine-bg': tema.corFundo,
  } as CSSProperties
}
