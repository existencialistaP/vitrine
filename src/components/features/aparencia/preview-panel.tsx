'use client'

import { useDeferredValue, type PointerEvent as ReactPointerEvent } from 'react'
import { EyeOff, Maximize2, Minimize2, Monitor, Smartphone, Tablet } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Storefront } from '@/components/features/vitrine/storefront'
import type { VitrineView } from '@/lib/vitrine-view'

import { DISPOSITIVOS, resolverLargura, type DispositivoId } from './preview-dispositivos'
import type { PreferenciasEditor } from './use-editor-preferencias'

const ICONES: Record<DispositivoId, typeof Smartphone> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
}

const LARGURA_INICIAL = 640

function BarraPreview({
  prefs,
  onAtualizar,
  onFechar,
}: {
  prefs: PreferenciasEditor
  onAtualizar: (patch: Partial<PreferenciasEditor>) => void
  onFechar: () => void
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
        aria-label={prefs.telaCheia ? 'Sair da tela cheia' : 'Abrir prévia em tela cheia'}
        aria-pressed={prefs.telaCheia}
        onClick={() =>
          onAtualizar(
            prefs.telaCheia
              ? { telaCheia: false }
              : { telaCheia: true, largura: null }
          )
        }
      >
        {prefs.telaCheia ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Fechar prévia" onClick={onFechar}>
        <EyeOff aria-hidden="true" />
      </Button>
    </div>
  )
}

function Moldura({
  vitrine,
  prefs,
  paginaId,
  onTrocarPagina,
  onRedimensionar,
}: {
  vitrine: VitrineView
  prefs: PreferenciasEditor
  paginaId: string
  onTrocarPagina: (id: string) => void
  onRedimensionar: (evento: ReactPointerEvent<HTMLDivElement>) => void
}) {
  // Deferir o objeto inteiro só tem efeito com o Storefront memoizado:
  // no render urgente (tecla) a criança memoizada ignora a referência antiga.
  const vitrineDeferida = useDeferredValue(vitrine)
  return (
    <div className="flex min-h-0 flex-1 justify-center overflow-hidden bg-muted/40 p-4">
      <div
        className="relative h-full max-h-full"
        style={{
          width: prefs.telaCheia ? '100%' : prefs.largura ?? '100%',
          maxWidth: '100%',
        }}
      >
        <div className="h-full overflow-y-auto rounded-xl ring-1 ring-border">
          <Storefront
            vitrine={vitrineDeferida}
            preview
            paginaId={paginaId}
            onTrocarPagina={onTrocarPagina}
          />
        </div>
        {!prefs.telaCheia && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Redimensionar prévia"
            onPointerDown={onRedimensionar}
            className="absolute -right-1 top-0 h-full w-2 cursor-col-resize touch-none"
          />
        )}
      </div>
    </div>
  )
}

export function PreviewPanel({
  vitrine,
  prefs,
  onAtualizar,
  paginaId,
  onTrocarPagina,
}: {
  vitrine: VitrineView
  prefs: PreferenciasEditor
  onAtualizar: (patch: Partial<PreferenciasEditor>) => void
  paginaId: string
  onTrocarPagina: (id: string) => void
}) {
  function redimensionar(evento: ReactPointerEvent<HTMLDivElement>) {
    evento.preventDefault()
    const inicio = evento.clientX
    const larguraInicial = prefs.largura ?? LARGURA_INICIAL
    const aoMover = (movimento: PointerEvent) => {
      onAtualizar({ largura: resolverLargura(larguraInicial + (movimento.clientX - inicio)) })
    }
    const aoSoltar = () => {
      window.removeEventListener('pointermove', aoMover)
      window.removeEventListener('pointerup', aoSoltar)
    }
    window.addEventListener('pointermove', aoMover)
    window.addEventListener('pointerup', aoSoltar)
  }

  function fechar() {
    onAtualizar({ oculta: true, telaCheia: false })
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={!prefs.oculta}
        onClick={() => onAtualizar({ oculta: !prefs.oculta })}
      >
        Prévia
      </Button>

      <Dialog
        open={!prefs.oculta}
        onOpenChange={(aberto) => {
          if (!aberto) fechar()
          else onAtualizar({ oculta: false })
        }}
      >
        <DialogContent
          showCloseButton={false}
          className={
            prefs.telaCheia
              ? 'fixed top-4 left-1/2 flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none -translate-x-1/2 flex-col gap-0 p-0 sm:max-w-none'
              : 'fixed top-20 left-1/2 flex w-[min(1100px,95vw)] max-w-none -translate-x-1/2 flex-col gap-0 p-0 sm:max-w-none'
          }
          style={
            prefs.telaCheia
              ? undefined
              : { height: 'min(calc(100dvh - 7rem), 70svh)' }
          }
        >
          <DialogTitle className="sr-only">Prévia da vitrine</DialogTitle>
          <BarraPreview prefs={prefs} onAtualizar={onAtualizar} onFechar={fechar} />
          <Moldura
            vitrine={vitrine}
            prefs={prefs}
            paginaId={paginaId}
            onTrocarPagina={onTrocarPagina}
            onRedimensionar={redimensionar}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
