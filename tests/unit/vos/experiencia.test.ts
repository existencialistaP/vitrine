import { describe, it, expect } from "vitest";
import {
  Experiencia,
  ExperienciaInvalida,
  MAX_PAGINAS_EXPERIENCIA,
  type BlockType,
  type BlocoExperiencia,
  type PaginaExperiencia,
} from "@/modules/loja/domain/vos/experiencia";

const bloco = (extra: Partial<BlocoExperiencia> = {}): BlocoExperiencia => ({
  id: "hero-1",
  type: "hero",
  label: "Hero",
  visible: true,
  props: { title: "Oi" },
  ...extra,
});

const paginaHome = (): PaginaExperiencia => ({
  id: "home-1",
  rotulo: "Home",
  ordem: 0,
  blocos: [bloco()],
});

describe("Experiencia (documento v2)", () => {
  it("deJson(null) é vazia", () => {
    expect(Experiencia.deJson(null).isEmpty()).toBe(true);
  });

  it("deJson([]) é vazia (v1 vazio → fallback initialPages)", () => {
    const experiencia = Experiencia.deJson([]);
    expect(experiencia.isEmpty()).toBe(true);
    expect(experiencia.getPaginas()).toHaveLength(0);
  });

  it("migra array legado v1 para uma página Home", () => {
    const experiencia = Experiencia.deJson([bloco()]);
    const paginas = experiencia.getPaginas();
    expect(paginas).toHaveLength(1);
    expect(paginas[0].rotulo).toBe("Home");
    expect(paginas[0].blocos).toHaveLength(1);
  });

  it("dePaginas valida documento v2", () => {
    const experiencia = Experiencia.dePaginas([paginaHome()]);
    const p = experiencia.getPaginas()[0];
    expect(p.blocos[0].props.title).toBe("Oi");
    expect(experiencia.paraJson().versao).toBe(2);
    expect(experiencia.getPaginas()).toHaveLength(1);
  });

  it("rejeita mais de 30 páginas", () => {
    const muitas = Array.from({ length: MAX_PAGINAS_EXPERIENCIA + 1 }, (_, i) => ({
      id: `p-${i}`,
      rotulo: `P${i}`,
      ordem: i,
      blocos: [],
    }));
    expect(() => Experiencia.dePaginas(muitas)).toThrow(ExperienciaInvalida);
  });

  it("rejeita rótulo vazio", () => {
    expect(() =>
      Experiencia.dePaginas([{ ...paginaHome(), rotulo: "  " }])
    ).toThrow(ExperienciaInvalida);
  });

  it("saneia props: remove chave desconhecida e aplica default", () => {
    const experiencia = Experiencia.dePaginas([
      { ...paginaHome(), blocos: [bloco({ props: { foo: "bar" } })] },
    ]);
    const props = experiencia.getPaginas()[0].blocos[0].props;
    expect(props).not.toHaveProperty("foo");
    expect(props.title).toBe("Sua marca, do seu jeito");
    expect(typeof props.buttonVisible).toBe("boolean");
  });

  it("rejeita tipo de bloco desconhecido", () => {
    expect(() =>
      Experiencia.dePaginas([
        { ...paginaHome(), blocos: [bloco({ type: "naoExiste" as BlockType })] },
      ])
    ).toThrow(ExperienciaInvalida);
  });

  it("isenção: deJson com formato inválido lança", () => {
    expect(() => Experiencia.deJson({ qualquer: 1 })).toThrow(ExperienciaInvalida);
  });
});