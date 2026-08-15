'use client'

import { useState, useTransition } from 'react'
import { ArrowDown, ArrowUp, Pencil, Plus, Tags, Trash2 } from 'lucide-react'

import {
  adicionarCategoriaAction,
  removerCategoriaAction,
  renomearCategoriaAction,
  reposicionarCategoriaAction,
} from '@/app/actions/loja'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { EmptyState } from '@/components/patterns/empty-state'

type CategoriaView = { id: string; nome: string; ordem: number }

function CategoriaFormDialog({
  aberto,
  onOpenChange,
  titulo,
  valorInicial,
  onSubmit,
}: {
  aberto: boolean
  onOpenChange: (aberto: boolean) => void
  titulo: string
  valorInicial: string
  onSubmit: (nome: string) => Promise<void>
}) {
  const [nome, setNome] = useState(valorInicial)
  const [erro, setErro] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function enviar() {
    const limpo = nome.trim()
    if (limpo.length < 2) {
      setErro('O nome deve ter no mínimo 2 caracteres.')
      return
    }
    setIsLoading(true)
    setErro(null)
    try {
      await onSubmit(limpo)
      setNome(valorInicial)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>
            Escolha um nome claro para identificar os produtos.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            enviar()
          }}
          noValidate
          className="flex flex-col gap-4"
        >
          <FieldGroup>
            <Field data-invalid={erro !== null}>
              <FieldLabel htmlFor="categoria-nome">Nome</FieldLabel>
              <Input
                id="categoria-nome"
                value={nome}
                onChange={(evento) => setNome(evento.target.value)}
                placeholder="Ex.: Doces"
                aria-invalid={erro !== null}
                autoFocus
              />
              {erro && <FieldError>{erro}</FieldError>}
            </Field>
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Spinner data-icon="inline-start" /> : null}
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function CategoriasManager({
  categorias,
}: {
  categorias: CategoriaView[]
}) {
  const [dialogNova, setDialogNova] = useState(false)
  const [dialogRenomear, setDialogRenomear] = useState<{
    aberto: boolean
    categoria?: CategoriaView
  }>({ aberto: false })
  const [isPending, startTransition] = useTransition()

  const ordenadas = [...categorias].sort((a, b) => a.ordem - b.ordem)

  function mover(categoria: CategoriaView, direcao: -1 | 1) {
    const indice = ordenadas.findIndex((c) => c.id === categoria.id)
    const novoIndice = indice + direcao
    if (novoIndice < 0 || novoIndice >= ordenadas.length) return

    const novaOrdem = ordenadas
      .map((c) => ({ ...c, ordem: 0 }))
      .map((c, i) => ({ ...c, ordem: i }))
    const [movida] = novaOrdem.splice(indice, 1)
    novaOrdem.splice(novoIndice, 0, movida)
    const final = novaOrdem.map((c, i) => ({ ...c, ordem: i }))

    startTransition(async () => {
      for (const item of final) {
        const resultado = await reposicionarCategoriaAction({
          categoriaId: item.id,
          ordem: item.ordem,
        })
        if (!resultado.ok) {
          toast.add({
            title: 'Não foi possível reordenar',
            description: resultado.error,
            type: 'error',
          })
          return
        }
      }
    })
  }

  function remover(categoria: CategoriaView) {
    startTransition(async () => {
      const resultado = await removerCategoriaAction(categoria.id)
      if (!resultado.ok) {
        toast.add({
          title: 'Não foi possível remover',
          description: resultado.error,
          type: 'error',
        })
        return
      }
      toast.add({
        title: 'Categoria removida',
        description: 'Os produtos foram mantidos, mas sem categoria.',
      })
    })
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {ordenadas.length} {ordenadas.length === 1 ? 'categoria' : 'categorias'}
        </p>
        <Button onClick={() => setDialogNova(true)}>
          <Plus data-icon="inline-start" />
          Nova categoria
        </Button>
      </div>

      {ordenadas.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria ainda"
          description="Crie categorias para organizar seus produtos."
          action={
            <Button onClick={() => setDialogNova(true)}>
              <Plus data-icon="inline-start" />
              Nova categoria
            </Button>
          }
        />
      ) : (
        <Card>
          <div className="flex flex-col divide-y divide-border">
            {ordenadas.map((categoria, indice) => (
              <div
                key={categoria.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-heading text-sm font-medium">
                    {categoria.nome}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={indice === 0 || isPending}
                    aria-label={`Mover ${categoria.nome} para cima`}
                    onClick={() => mover(categoria, -1)}
                  >
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={indice === ordenadas.length - 1 || isPending}
                    aria-label={`Mover ${categoria.nome} para baixo`}
                    onClick={() => mover(categoria, 1)}
                  >
                    <ArrowDown aria-hidden="true" />
                  </Button>
                  <Separator orientation="vertical" className="mx-1 h-4" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Renomear ${categoria.nome}`}
                    onClick={() =>
                      setDialogRenomear({ aberto: true, categoria })
                    }
                  >
                    <Pencil aria-hidden="true" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remover ${categoria.nome}`}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      }
                    />
                    <AlertDialogContent size="sm">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover categoria?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong>{categoria.nome}</strong> será removida. Os
                          produtos continuam na vitrine, sem categoria.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => remover(categoria)}
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <CategoriaFormDialog
        aberto={dialogNova}
        onOpenChange={setDialogNova}
        titulo="Nova categoria"
        valorInicial=""
        onSubmit={async (nome) => {
          const resultado = await adicionarCategoriaAction({ nome })
          if (!resultado.ok) {
            toast.add({
              title: 'Não foi possível criar',
              description: resultado.error,
              type: 'error',
            })
            throw new Error(resultado.error)
          }
          toast.add({
            title: 'Categoria criada',
            description: `${nome} foi adicionada.`,
            type: 'success',
          })
        }}
      />

      <CategoriaFormDialog
        key={dialogRenomear.categoria?.id ?? 'renomear'}
        aberto={dialogRenomear.aberto}
        onOpenChange={(aberto) => setDialogRenomear({ aberto })}
        titulo="Renomear categoria"
        valorInicial={dialogRenomear.categoria?.nome ?? ''}
        onSubmit={async (nome) => {
          const categoria = dialogRenomear.categoria
          if (!categoria) return
          const resultado = await renomearCategoriaAction({
            categoriaId: categoria.id,
            nome,
          })
          if (!resultado.ok) {
            toast.add({
              title: 'Não foi possível renomear',
              description: resultado.error,
              type: 'error',
            })
            throw new Error(resultado.error)
          }
          toast.add({
            title: 'Categoria renomeada',
            type: 'success',
          })
        }}
      />
    </>
  )
}
