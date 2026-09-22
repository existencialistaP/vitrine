import { describe, expect, it } from "vitest";

import {
  PRESETS_APARENCIA,
  encontrarPreset,
  presetParaTema,
  type TemaSelecao,
} from "@/components/features/aparencia/aparencia-presets";
import { ESTILOS, FONTES, FORMATOS_CARD, LAYOUTS, PALETAS } from "@/lib/visual";

describe("presets de aparência", () => {
  it("todo preset produz um tema com ids presentes nos catálogos", () => {
    for (const preset of PRESETS_APARENCIA) {
      const tema = presetParaTema(preset);
      expect(PALETAS.some((p) => p.id === tema.paleta)).toBe(true);
      expect(ESTILOS.some((e) => e.id === tema.estilo)).toBe(true);
      expect(FORMATOS_CARD.some((f) => f.id === tema.formatoCard)).toBe(true);
      expect(LAYOUTS.some((l) => l.id === tema.layout)).toBe(true);
      expect(FONTES.some((f) => f.id === tema.fonte)).toBe(true);
    }
  });

  it("encontra o preset que corresponde ao tema exato", () => {
    const preset = PRESETS_APARENCIA[0];
    expect(encontrarPreset(presetParaTema(preset))?.id).toBe(preset.id);
  });

  it("retorna null para tema personalizado", () => {
    const tema: TemaSelecao = { ...presetParaTema(PRESETS_APARENCIA[0]), paleta: "CARVAO" };
    expect(encontrarPreset(tema)).toBeNull();
  });
});
