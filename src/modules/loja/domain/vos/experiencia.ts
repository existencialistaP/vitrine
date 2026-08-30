import type { ValueObject } from "@/kernel/ddd/value-object";
import { InvalidDomainError } from "@/kernel/errors/domain-error";

export class ExperienciaInvalida extends InvalidDomainError {
  readonly code = "EXPERIENCIA_INVALIDA";

  constructor(motivo: string) {
    super(`A experiência da vitrine é inválida: ${motivo}.`);
  }
}

/** Bloco estrutural da vitrine (construtor da vitrine). */
export interface BlocoExperiencia {
  id: string;
  type: string;
  label: string;
  visible: boolean;
  props: Record<string, unknown>;
}

export const MAX_BLOCOS_EXPERIENCIA = 100;

function validarBloco(bloco: unknown): asserts bloco is BlocoExperiencia {
  if (
    typeof bloco !== "object" ||
    bloco === null ||
    typeof (bloco as BlocoExperiencia).id !== "string" ||
    (bloco as BlocoExperiencia).id.trim().length === 0 ||
    typeof (bloco as BlocoExperiencia).type !== "string" ||
    typeof (bloco as BlocoExperiencia).label !== "string" ||
    typeof (bloco as BlocoExperiencia).visible !== "boolean" ||
    typeof (bloco as BlocoExperiencia).props !== "object" ||
    (bloco as BlocoExperiencia).props === null
  ) {
    throw new ExperienciaInvalida("estrutura de bloco inválida");
  }
}

/**
 * Experiência da vitrine: a página construída com blocos (hero, coleções,
 * sobre, CTA etc.). Objeto de valor imutável com o estrutura validada na
 * fronteira; o conteúdo interpretado fica a cargo da camada de apresentação.
 */
export class Experiencia implements ValueObject {
  private constructor(private readonly blocos: readonly BlocoExperiencia[]) {}

  /** Experiência padrao (vazia); a vitrine assume os blocos iniciais. */
  static vazia(): Experiencia {
    return new Experiencia([]);
  }

  static deBlocos(blocos: readonly BlocoExperiencia[]): Experiencia {
    if (!Array.isArray(blocos)) {
      throw new ExperienciaInvalida("deve ser uma lista de blocos");
    }
    if (blocos.length > MAX_BLOCOS_EXPERIENCIA) {
      throw new ExperienciaInvalida(
        `máximo de ${MAX_BLOCOS_EXPERIENCIA} blocos`
      );
    }
    blocos.forEach(validarBloco);
    return new Experiencia(blocos.map((bloco) => ({ ...bloco })));
  }

  /** Reconstrói a partir do valor JSON persistido (`null` = vazia). */
  static deJson(valor: unknown): Experiencia {
    if (valor === null || valor === undefined) return Experiencia.vazia();
    if (!Array.isArray(valor)) {
      throw new ExperienciaInvalida("formato não é uma lista");
    }
    return Experiencia.deBlocos(
      valor as readonly BlocoExperiencia[]
    );
  }

  getBlocos(): readonly BlocoExperiencia[] {
    return Object.freeze([...this.blocos]);
  }

  isEmpty(): boolean {
    return this.blocos.length === 0;
  }

  paraJson(): readonly BlocoExperiencia[] {
    return this.blocos;
  }

  equals(other: unknown): boolean {
    return (
      other instanceof Experiencia &&
      JSON.stringify(other.blocos) === JSON.stringify(this.blocos)
    );
  }
}