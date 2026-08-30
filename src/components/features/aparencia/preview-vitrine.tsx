'use client'

import { useDeferredValue, useState } from 'react'
import { Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import {
  Empty,
  EmptyDescription,
  EmptyTitle,
} from '@/components/ui/empty'
import { Storefront } from '@/components/features/vitrine/storefront'
import type { PaginaExperiencia } from '@/lib/experience'
import type { VitrineBase, VitrineView } from '@/lib/vitrine-view'

const LARGURAS = {
  mobile: 'max-w-[390px]',
  tablet: 'max-w-[768px]',
  desktop: 'max-w-full',
} as const

export function PreviewVitrine({
  base,
  paginas,
  aberto,
  onAbrirChange,
}: {
  base: VitrineBase
  paginas: PaginaExperiencia[]
  aberto: boolean
  onAbrirChange: (aberto: boolean) => void
}) {
  const [device, setDevice] = useState<keyof typeof LARGURAS>('mobile')
  const paginasDeferidas = useDeferredValue(paginas)

  const vitrine: VitrineView = { ...base, paginas: paginasDeferidas }

  const PreviewInterno = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b p-2">
        <span className="text-sm font-medium">Preview ao vivo</span>
        <div className="flex gap-1">
          {(Object.keys(LARGURAS) as (keyof typeof LARGURAS)[]).map((d) => (
            <Button
              key={d}
              variant={device === d ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDevice(d)}
            >
              {d}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-1 justify-center overflow-y-auto bg-muted/40 p-2">
        <div className={`w-full ${LARGURAS[device]} overflow-hidden rounded-xl ring-1 ring-border`}>
          <Storefront vitrine={vitrine} preview />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="hidden min-w-0 flex-1 lg:block">
        {paginas.length === 0 ? (
          <Empty>
            <EmptyTitle>Nenhuma página ainda</EmptyTitle>
            <EmptyDescription>Adicione uma camada para ver a prévia.</EmptyDescription>
          </Empty>
        ) : (
          PreviewInterno
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="lg:hidden"
        onClick={() => onAbrirChange(true)}
      >
        <Eye data-icon="inline-start" />
        Preview
      </Button>
      <Sheet open={aberto} onOpenChange={onAbrirChange}>
        <SheetContent side="bottom" className="p-0">
          <SheetTitle className="sr-only">Preview da vitrine</SheetTitle>
          {PreviewInterno}
        </SheetContent>
      </Sheet>
    </>
  )
}