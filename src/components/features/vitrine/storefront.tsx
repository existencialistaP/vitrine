'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { VitrineView } from '@/lib/vitrine-view'

import { ExperienceRenderer } from './experience-renderer'
import { OrderSheet } from './order-sheet'
import { VitrineHeader } from './vitrine-header'
import { estiloTema } from './tema-vitrine'
import { useCarrinho } from './use-carrinho'

export function Storefront({
  vitrine,
  preview = false,
}: {
  vitrine: VitrineView
  preview?: boolean
}) {
  const [sheetAberto, setSheetAberto] = useState(false)
  const [paginaId, setPaginaId] = useState(vitrine.paginas[0]?.id ?? '')
  const { itens, totalItens, adicionar, alterarQuantidade, limpar, adicionadoId } =
    useCarrinho(vitrine.slug, { habilitado: !preview })

  const paginaAtiva = vitrine.paginas.find((p) => p.id === paginaId) ?? vitrine.paginas[0]

  return (
    <div
      className="min-h-svh bg-(--vitrine-bg)"
      style={estiloTema(vitrine.tema)}
    >
      <VitrineHeader
        vitrine={vitrine}
        totalItens={totalItens}
        onAbrirPedido={preview ? undefined : () => setSheetAberto(true)}
      />

      {vitrine.paginas.length > 1 && (
        <div className="sticky top-14 z-30 border-b border-border/60 bg-(--vitrine-bg)/90 backdrop-blur-md">
          <Tabs
            value={paginaId}
            onValueChange={setPaginaId}
            className="mx-auto max-w-5xl px-4 sm:px-6"
          >
            <TabsList variant="line" className="h-10 w-full">
              {vitrine.paginas.map((pagina) => (
                <TabsTrigger key={pagina.id} value={pagina.id}>
                  {pagina.rotulo}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <main className="mx-auto w-full max-w-5xl px-4 pb-20 sm:px-6">
        {paginaAtiva ? (
          <ExperienceRenderer
            blocks={paginaAtiva.blocos}
            vitrine={vitrine}
            onAdd={preview ? undefined : adicionar}
            adicionadoId={adicionadoId}
            preview={preview}
          />
        ) : null}
      </main>

      {!preview && (
        <OrderSheet
          vitrine={vitrine}
          itens={itens}
          aberto={sheetAberto}
          onOpenChange={setSheetAberto}
          onAlterarQuantidade={alterarQuantidade}
          onLimpar={limpar}
        />
      )}
    </div>
  )
}
