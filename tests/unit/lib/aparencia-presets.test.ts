import { describe, expect, it } from "vitest";

import {
  PRESETS_APARENCIA,
  encontrarPreset,
  presetParaTema,
} from "@/components/features/aparencia/aparencia-presets";

describe("presets de aparência", () => {
  it("todo preset produz um tema completo e válido", () => {
    for (const preset of PRESETS_APARENCIA) {
      const tema = presetParaTema(preset);
      expect(tema.paleta).toBeTruthy();
      expect(tema.estilo).toBeTruthy();
      expect(tema.formatoCard).toBeTruthy();
      expect(tema.layout).toBeTruthy();
      expect(tema.fonte).toBeTruthy();
    }
  });

  it("encontra o preset que corresponde ao tema exato", () => {
    const preset = PRESETS_APARENCIA[0];
    expect(encontrarPreset(presetParaTema(preset))?.id).toBe(preset.id);
  });

  it("retorna null para tema personalizado", () => {
    const tema = { ...presetParaTema(PRESETS_APARENCIA[0]), paleta: "CARVAO" };
    expect(encontrarPreset(tema)).toBeNull();
  });
});
