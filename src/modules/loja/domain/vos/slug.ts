import type { ValueObject } from "@/kernel/ddd/value-object";
import { SlugInvalido } from "../exceptions/slug-invalido";

const MIN_LENGTH = 3;
const MAX_LENGTH = 60;

/**
 * Slug da vitrine: identificador legível e único usado na URL pública
 * (ex.: https://vitrine.app/minha-loja). Normaliza acentos, espaços e
 * caracteres especiais para {@code [a-z0-9-]}.
 */
export class Slug implements ValueObject {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /** Normaliza um texto qualquer em um slug válido (ex.: "Minha Loja" → "minha-loja"). */
  static deTexto(texto: string): Slug {
    const normalizado = texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return Slug.of(normalizado);
  }

  static of(raw: string): Slug {
    const slug = raw.trim().toLowerCase();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      throw new SlugInvalido("apenas letras minúsculas, números e hífens");
    }
    if (slug.length < MIN_LENGTH) {
      throw new SlugInvalido(`mínimo de ${MIN_LENGTH} caracteres`);
    }
    if (slug.length > MAX_LENGTH) {
      throw new SlugInvalido(`máximo de ${MAX_LENGTH} caracteres`);
    }
    return new Slug(slug);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: unknown): boolean {
    return other instanceof Slug && other.value === this.value;
  }

  toString(): string {
    return this.value;
  }
}
