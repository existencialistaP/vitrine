/**
 * Estado operacional da vitrine.
 */
export const StatusLoja = {
  ATIVA: "ATIVA",
  INATIVA: "INATIVA",
} as const;

export type StatusLoja = (typeof StatusLoja)[keyof typeof StatusLoja];
