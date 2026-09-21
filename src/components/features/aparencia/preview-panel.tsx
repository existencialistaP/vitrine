'use client'

import { useDeferredValue } from 'react'
import { Eye, EyeOff, Maximize2, Monitor, Smartphone, Tablet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Storefront } from '@/components/features/vitrine/storefront'
import type { VitrineView } from '@/lib/vitrine-view'

import { DISPOSITIVOS, type DispositivoId } from './preview-dispositivos'
import { useMediaQuery } from './use-media-query'
import type { PreferenciasEditor } from './use-editor-preferencias'

const ICONES: Record<DispositivoId, typeof Smartphone> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
}

function BarraPreview({
  prefs,
  onAtualizar,
}: {
  prefs: PreferenciasEditor
  onAtualizar: (patch: Partial<PreferenciasEditor>) => void
}) {
  return (
    <div className="flex items-center gap-1 border-b p-2">
      <div className="flex items-center gap-1" role="group" aria-label="Tamanho da prévia">
        {(Object.keys(DISPOSITIVOS) as DispositivoId[]).map((id) => {
          const Icone = ICONES[id]
          const ativo = prefs.dispositivo === id
          return (
            <Button
              key={id}
              variant={ativo ? 'secondary' : 'ghost'}
              size="icon-sm"
              aria-label={`Prévia ${DISPOSITIVOS[id].rotulo}`}
              aria-pressed={ativo}
              onClick={() => onAtualizar({ dispositivo: id, largura: DISPOSITIVOS[id].largura })}
            >
              <Icone aria-hidden="true" />
            </Button>
          )
        })}
      </div>
      <span className="flex-1" />
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Abrir prévia em tela cheia"
        onClick={() => onAtualizar({ telaCheia: true })}
      >
        <Maximize2 aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Ocultar prévia"
        onClick={() => onAtualizar({ oculta: true })}
      >
        <EyeOff aria-hidden="true" />
      </Button>
    </div>
  )
}

function Moldura({ vitrine, largura }: { vitrine: VitrineView; largura: number | null }) {
  // Deferir o objeto inteiro só tem efeito com o Storefront memoizado (Task 3):
  // no render urgente (tecla) a criança memoizada ignora a referência antiga.
  const vitrineDeferida = useDeferredValue(vitrine)
  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-auto bg-muted/40 p-3">
      <div
        className="h-full overflow-hidden rounded-xl ring-1 ring-border"
        style={{ width: largura ?? '100%', maxWidth: '100%' }}
      >
        <Storefront vitrine={vitrineDeferida} preview />
      </div>
    </div>
  )
}

export function PreviewPanel({
  vitrine,
  prefs,
  onAtualizar,
  abertoMobile,
  onAbertoMobileChange,
}: {
  vitrine: VitrineView
  prefs: PreferenciasEditor
  onAtualizar: (patch: Partial<PreferenciasEditor>) => void
  abertoMobile: boolean
  onAbertoMobileChange: (aberto: boolean) => void
}) {
  const ehDesktop = useMediaQuery('(min-width: 64rem)')

  const conteudo = (
    <div className="flex h-full min-h-0 flex-col">
      <BarraPreview prefs={prefs} onAtualizar={onAtualizar} />
      <Moldura vitrine={vitrine} largura={prefs.largura} />
    </div>
  )

  const mostrarColuna = ehDesktop && !prefs.oculta && !prefs.telaCheia

  return (
    <>
      {mostrarColuna ? (
        <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
          {conteudo}
        </div>
      ) : null}

      {ehDesktop && prefs.oculta ? (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAtualizar({ oculta: false })}
        >
          <Eye data-icon="inline-start" />
          Mostrar prévia
        </Button>
      ) : null}

      {!ehDesktop && !prefs.telaCheia ? (
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => onAbertoMobileChange(true)}
        >
          <Eye data-icon="inline-start" />
          Prévia
        </Button>
      ) : null}

      <Sheet open={abertoMobile} onOpenChange={onAbertoMobileChange}>
        <SheetContent side="bottom" className="h-[85svh] p-0">
          <SheetTitle className="sr-only">Prévia da vitrine</SheetTitle>
          {conteudo}
        </SheetContent>
      </Sheet>

      <Dialog open={prefs.telaCheia} onOpenChange={(aberto) => onAtualizar({ telaCheia: aberto })}>
        <DialogContent className="h-[92svh] w-[95vw] max-w-none p-0 sm:max-w-none">
          <DialogTitle className="sr-only">Prévia em tela cheia</DialogTitle>
          {conteudo}
        </DialogContent>
      </Dialog>
    </>
  )
}
