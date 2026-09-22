import { describe, expect, it } from "vitest";

import {
  DISPOSITIVO_PADRAO,
  LARGURA_MAX,
  LARGURA_MIN,
  resolverDispositivo,
  resolverLargura,
  resolverOculta,
} from "@/components/features/aparencia/preview-dispositivos";

describe("dispositivos da prévia", () => {
  it("resolve ids válidos e cai no padrão para inválidos", () => {
    expect(resolverDispositivo("tablet")).toBe("tablet");
    expect(resolverDispositivo("tv")).toBe(DISPOSITIVO_PADRAO);
    expect(resolverDispositivo(undefined)).toBe(DISPOSITIVO_PADRAO);
  });

  it("limita a largura à faixa permitida", () => {
    expect(resolverLargura(500)).toBe(500);
    expect(resolverLargura(10)).toBe(LARGURA_MIN);
    expect(resolverLargura(99999)).toBe(LARGURA_MAX);
    expect(resolverLargura("x")).toBeNull();
  });

  it("resolve oculta apenas para booleano true", () => {
    expect(resolverOculta(true)).toBe(true);
    expect(resolverOculta("true")).toBe(false);
  });
});
