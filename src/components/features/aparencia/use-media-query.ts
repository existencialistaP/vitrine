'use client'

import { useEffect, useState } from 'react'

/** Media query SSR-safe: false no primeiro paint, corrigida após o mount. */
export function useMediaQuery(query: string): boolean {
  const [combina, setCombina] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    const atualizar = () => setCombina(media.matches)
    atualizar()
    media.addEventListener('change', atualizar)
    return () => media.removeEventListener('change', atualizar)
  }, [query])

  return combina
}
