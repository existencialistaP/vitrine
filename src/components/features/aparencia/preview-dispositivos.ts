/** Presets de dispositivo da prévia (larguras centralizadas; RF-6). */
export const DISPOSITIVOS = {
  mobile: { rotulo: 'Celular', largura: 390 },
  tablet: { rotulo: 'Tablet', largura: 768 },
  desktop: { rotulo: 'Computador', largura: null },
} as const

export type DispositivoId = keyof typeof DISPOSITIVOS

export const DISPOSITIVO_PADRAO: DispositivoId = 'mobile'
export const LARGURA_MIN = 320
export const LARGURA_MAX = 1600

export function resolverDispositivo(valor: unknown): DispositivoId {
  return valor === 'mobile' || valor === 'tablet' || valor === 'desktop'
    ? valor
    : DISPOSITIVO_PADRAO
}

export function resolverLargura(valor: unknown): number | null {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) return null
  return Math.min(Math.max(Math.round(valor), LARGURA_MIN), LARGURA_MAX)
}

export function resolverOculta(valor: unknown): boolean {
  return valor === true
}
