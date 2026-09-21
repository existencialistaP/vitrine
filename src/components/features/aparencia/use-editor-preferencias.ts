'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  DISPOSITIVO_PADRAO,
  resolverDispositivo,
  resolverLargura,
  resolverOculta,
  type DispositivoId,
} from './preview-dispositivos'

const CHAVE = 'vitrine:editor:preferencias:v1'

export type PreferenciasEditor = {
  modoAvancado: boolean
  dispositivo: DispositivoId
  largura: number | null
  oculta: boolean
  telaCheia: boolean
}

const PADRAO: PreferenciasEditor = {
  modoAvancado: false,
  dispositivo: DISPOSITIVO_PADRAO,
  largura: null,
  oculta: false,
  telaCheia: false,
}

export function useEditorPreferencias() {
  const [prefs, setPrefs] = useState<PreferenciasEditor>(PADRAO)
  const [pronto, setPronto] = useState(false)

  useEffect(() => {
    try {
      const bruto = window.localStorage.getItem(CHAVE)
      if (bruto) {
        const dado = JSON.parse(bruto) as Record<string, unknown>
        // eslint-disable-next-line react-hooks/set-state-in-effect -- reidratação pós-mount: evita mismatch de hidratação (localStorage não existe no SSR)
        setPrefs({
          modoAvancado: dado.modoAvancado === true,
          dispositivo: resolverDispositivo(dado.dispositivo),
          largura: resolverLargura(dado.largura),
          oculta: resolverOculta(dado.oculta),
          telaCheia: false,
        })
      }
    } catch {
      // storage indisponível: segue com padrões
    }
    setPronto(true)
  }, [])

  useEffect(() => {
    if (!pronto) return
    try {
      window.localStorage.setItem(CHAVE, JSON.stringify(prefs))
    } catch {
      // sem persistência: estado em memória continua
    }
  }, [prefs, pronto])

  const atualizar = useCallback((patch: Partial<PreferenciasEditor>) => {
    setPrefs((atual) => ({ ...atual, ...patch }))
  }, [])

  return { prefs, pronto, atualizar }
}
