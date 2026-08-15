'use client'

import { useState, useTransition } from 'react'
import { MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react'

import { formatarPedidoAction } from '@/app/actions/pedido'
import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import {
  Field,
  FieldLabel,
} from '@/components/ui/field'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import type { VitrineView } from '@/lib/vitrine-view'

type ItemCarrinho = {
  id: string
  nome: string
  precoCents: number
  precoFormatado: string
  quantidade: number
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function OrderSheet({
  vitrine,
  itens,
  aberto,
  onOpenChange,
  onAlterarQuantidade,
  onLimpar,
}: {
  vitrine: VitrineView
  itens: ItemCarrinho[]
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  onAlterarQuantidade: (id: string, quantidade: number) => void
  onLimpar: () => void
}) {
  const [observacao, setObservacao] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const totalCents = itens.reduce(
    (soma, item) => soma + item.precoCents * item.quantidade,
    0
  )

  function finalizar() {
    setErro(null)
    startTransition(async () => {
      try {
        const resultado = await formatarPedidoAction({
          lojaNome: vitrine.nome,
          whatsapp: vitrine.whatsapp,
          itens: itens.map((item) => ({
            id: item.id,
            nome: item.nome,
            quantidade: item.quantidade,
            precoCents: item.precoCents,
          })),
          observacao: observacao.trim() || undefined,
        })
        window.open(resultado.linkWhatsapp, '_blank', 'noopener')
        setObservacao('')
        onLimpar()
        onOpenChange(false)
      } catch {
        setErro('Não foi possível gerar o pedido. Tente novamente.')
      }
    })
  }

  return (
    <Sheet open={aberto} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Seu pedido</SheetTitle>
          <SheetDescription>
            Revise os itens e finalize pelo WhatsApp.
          </SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4">
          {itens.length === 0 ? (
            <Empty className="my-auto">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag aria-hidden="true" />
                </EmptyMedia>
                <EmptyContent>
                  <EmptyTitle>Carrinho vazio</EmptyTitle>
                  <EmptyDescription>
                    Adicione produtos para montar seu pedido.
                  </EmptyDescription>
                </EmptyContent>
              </EmptyHeader>
            </Empty>
          ) : (
            <>
              {itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-sm font-medium">
                      {item.nome}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {item.precoFormatado}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Diminuir quantidade de ${item.nome}`}
                      onClick={() =>
                        onAlterarQuantidade(item.id, item.quantidade - 1)
                      }
                    >
                      <Minus aria-hidden="true" />
                    </Button>
                    <span className="w-6 text-center text-sm font-medium tabular-nums">
                      {item.quantidade}
                    </span>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      aria-label={`Aumentar quantidade de ${item.nome}`}
                      onClick={() =>
                        onAlterarQuantidade(item.id, item.quantidade + 1)
                      }
                    >
                      <Plus aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              ))}

              <Separator />

              <Field>
                <FieldLabel htmlFor="observacao">Observações</FieldLabel>
                <Textarea
                  id="observacao"
                  rows={3}
                  placeholder="Ex.: sem chantilly, entregar após as 18h..."
                  value={observacao}
                  onChange={(evento) => setObservacao(evento.target.value)}
                />
              </Field>
            </>
          )}
        </div>

        <SheetFooter>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-heading text-lg font-semibold tabular-nums">
              {brl.format(totalCents / 100)}
            </span>
          </div>
          {erro && <p className="text-sm text-destructive">{erro}</p>}
          <Button
            className="w-full bg-(--vitrine-primary) text-white hover:bg-(--vitrine-primary)/90"
            onClick={finalizar}
            disabled={itens.length === 0 || isPending}
          >
            {isPending ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <MessageCircle data-icon="inline-start" />
            )}
            {isPending
              ? 'Gerando pedido...'
              : 'Finalizar pedido no WhatsApp'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
