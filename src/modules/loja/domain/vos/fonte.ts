import { InvalidDomainError } from "@/kernel/errors/domain-error";

/** Tipografia da identidade visual. */
export const Fonte = {
  SANS: "SANS",
  MANROPE: "MANROPE",
  SERIF: "SERIF",
  DISPLAY: "DISPLAY",
  MONO: "MONO",
} as const;

export type Fonte = (typeof Fonte)[keyof typeof Fonte];

export class FonteInvalida extends InvalidDomainError {
  readonly code = "FONTE_INVALIDA";

  constructor(fonte?: unknown) {
    super(`A fonte informada é inválida${fonte !== undefined ? `: ${String(fonte)}` : ""}.`);
  }
}

/** Converte um valor arbitrário em {@link Fonte} (normaliza maiúsculas). */
export function parseFonte(valor: string | null | undefined): Fonte | null {
  if (valor === null || valor === undefined) return null;
  const chave = valor.toUpperCase();
  const registrada = Object.values(Fonte).find((f) => f === chave);
  if (!registrada) throw new FonteInvalida(valor);
  return registrada;
}
