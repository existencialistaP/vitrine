import type { ModoEditor, SujeiraEditor } from './editor-tipos'

export type { ModoEditor, SujeiraEditor } from './editor-tipos'

export function sujeiraInicial(): SujeiraEditor {
  return { conteudo: false, aparencia: false }
}

export function marcarSujo(sujeira: SujeiraEditor, modo: ModoEditor): SujeiraEditor {
  if (sujeira[modo]) return sujeira
  return { ...sujeira, [modo]: true }
}

export function limparSujo(sujeira: SujeiraEditor, modo: ModoEditor): SujeiraEditor {
  if (!sujeira[modo]) return sujeira
  return { ...sujeira, [modo]: false }
}

export function temAlteracoes(sujeira: SujeiraEditor): boolean {
  return sujeira.conteudo || sujeira.aparencia
}
