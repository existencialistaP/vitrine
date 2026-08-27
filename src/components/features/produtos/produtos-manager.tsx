'use client'

import { useMemo, useState, useTransition } from 'react'
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react'

import {
  alterarDisponibilidadeAction,
  removerProdutoAction,
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
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from '@/components/ui/toast'
import { EmptyState } from '@/components/patterns/empty-state'
import { cn } from '@/lib/utils'

import { ProdutoForm } from './produto-form'

type ProdutoView = {
  id: string
  nome: string
  descricao: string
  precoCents: number
  precoFormatado: string
  categoriaId: string | null
  imagemUrl: string | null
  disponivel: boolean
}

type CategoriaView = { id: string; nome: string }

export function ProdutosManager({
  produtos,
  categorias,
}: {
  produtos: ProdutoView[]
  categorias: CategoriaView[]
}) {
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas')
  const [dialog, setDialog] = useState<{
    aberto: boolean
    produto?: ProdutoView
  }>({ aberto: false })
  const [isPending, startTransition] = useTransition()

  const nomeCategoria = useMemo(() => {
    const mapa = new Map(categorias.map((c) => [c.id, c.nome]))
    return (id: string | null) => (id ? mapa.get(id) : undefined)
  }, [categorias])

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return produtos.filter((produto) => {
      const matchBusca =
        !termo || produto.nome.toLowerCase().includes(termo)
      const matchCategoria =
        categoriaFiltro === 'todas' || produto.categoriaId === categoriaFiltro
      return matchBusca && matchCategoria
    })
  }, [produtos, busca, categoriaFiltro])

  function alternarDisponivel(produto: ProdutoView, disponivel: boolean) {
    startTransition(async () => {
      const resultado = await alterarDisponibilidadeAction(
        produto.id,
        disponivel
      )
      if (!resultado.ok) {
        toast.add({
          title: 'Não foi possível atualizar',
          description: resultado.error,
          type: 'error',
        })
      }
    })
  }

  function remover(produto: ProdutoView) {
    startTransition(async () => {
      const resultado = await removerProdutoAction(produto.id)
      if (!resultado.ok) {
        toast.add({
          title: 'Não foi possível remover',
          description: resultado.error,
          type: 'error',
        })
        return
      }
      toast.add({
        title: 'Produto removido',
        description: `${produto.nome} foi removido da vitrine.`,
      })
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <InputGroup className="max-w-xs">
            <InputGroupAddon>
              <Search className="size-4" aria-hidden="true" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Buscar produto..."
              aria-label="Buscar produto"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
            />
          </InputGroup>
          <Select
            value={categoriaFiltro}
            onValueChange={(valor) => setCategoriaFiltro(valor ?? 'todas')}
          >
            <SelectTrigger className="min-w-40" aria-label="Filtrar por categoria">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as categorias</SelectItem>
              {categorias.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setDialog({ aberto: true })}>
          <Plus data-icon="inline-start" />
          Novo produto
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>
          <strong className="text-foreground">{filtrados.length}</strong>{' '}
          {filtrados.length === 1 ? 'produto' : 'produtos'}
        </span>
        {categoriaFiltro !== 'todas' && (
          <>
            <span className="text-border">|</span>
            <span>
              Categoria: <strong className="text-foreground">{nomeCategoria(categoriaFiltro)}</strong>
            </span>
          </>
        )}
        {busca && (
          <>
            <span className="text-border">|</span>
            <span>
              Busca: <strong className="text-foreground">&ldquo;{busca}&rdquo;</strong>
            </span>
          </>
        )}
      </div>

      {/* Table */}
      {filtrados.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            produtos.length === 0
              ? 'Nenhum produto ainda'
              : 'Nenhum resultado'
          }
          description={
            produtos.length === 0
              ? 'Adicione seu primeiro produto para começar a vender.'
              : 'Ajuste a busca ou os filtros para encontrar produtos.'
          }
          action={
            produtos.length === 0 ? (
              <Button onClick={() => setDialog({ aberto: true })}>
                <Plus data-icon="inline-start" />
                Adicionar produto
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Produto</TableHead>
                <TableHead className="w-[20%]">Categoria</TableHead>
                <TableHead className="w-[15%]">Preço</TableHead>
                <TableHead className="w-[15%]">Disponível</TableHead>
                <TableHead className="w-[10%] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((produto) => (
                <TableRow
                  key={produto.id}
                  className={cn(
                    !produto.disponivel && 'opacity-60'
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                        {produto.imagemUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={produto.imagemUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Package
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium">
                          {produto.nome}
                        </span>
                        {produto.descricao && (
                          <span className="line-clamp-1 text-sm text-muted-foreground">
                            {produto.descricao}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {nomeCategoria(produto.categoriaId) ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums font-medium">
                    {produto.precoFormatado}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={produto.disponivel}
                      disabled={isPending}
                      aria-label={`Alternar disponibilidade de ${produto.nome}`}
                      onCheckedChange={(disponivel) =>
                        alternarDisponivel(produto, disponivel)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Editar ${produto.nome}`}
                        onClick={() =>
                          setDialog({ aberto: true, produto })
                        }
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remover ${produto.nome}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          }
                        />
                        <AlertDialogContent size="sm">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remover produto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              <strong>{produto.nome}</strong> será removido da
                              sua vitrine. Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => remover(produto)}
                            >
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Product form dialog */}
      <Dialog
        open={dialog.aberto}
        onOpenChange={(aberto) => setDialog({ aberto })}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {dialog.produto ? 'Editar produto' : 'Novo produto'}
            </DialogTitle>
            <DialogDescription>
              {dialog.produto
                ? 'Atualize os dados do produto.'
                : 'Preencha os dados do novo produto.'}
            </DialogDescription>
          </DialogHeader>
          <ProdutoForm
            key={dialog.produto?.id ?? 'novo'}
            categorias={categorias}
            produto={dialog.produto}
            onSucesso={() => setDialog({ aberto: false })}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}