import { ExternalLink, Package, Store, Tags } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { requireMinhaLoja } from '@/lib/loja'

export default async function DashboardPage() {
  const loja = await requireMinhaLoja()

  const produtos = loja.getProdutos()
  const categorias = loja.getCategorias()
  const ativa = loja.isAtiva()
  const slug = loja.getSlug().getValue()

  return (
    <>
      <PageHeader>
        <PageHeaderContent>
          <PageHeaderTitle>Visão geral</PageHeaderTitle>
          <PageHeaderDescription>
            {loja.getNome().getValue()} — acompanhe sua vitrine.
          </PageHeaderDescription>
        </PageHeaderContent>
        <PageHeaderActions>
          <Button
            render={
              <a href={`/${slug}`} target="_blank" rel="noreferrer" />
            }
          >
            <ExternalLink data-icon="inline-start" />
            Ver vitrine
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="size-4 text-muted-foreground" aria-hidden="true" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-2">
            <Badge variant={ativa ? 'secondary' : 'destructive'}>
              {ativa ? 'Ativa' : 'Inativa'}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {ativa
                ? 'Sua vitrine está visível ao público.'
                : 'Sua vitrine está oculta para o público.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" aria-hidden="true" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold tabular-nums">
              {produtos.length}
            </p>
            <p className="text-sm text-muted-foreground">Itens na vitrine</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tags className="size-4 text-muted-foreground" aria-hidden="true" />
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-heading text-2xl font-semibold tabular-nums">
              {categorias.length}
            </p>
            <p className="text-sm text-muted-foreground">Grupos de produtos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Endereço público</CardTitle>
          <CardDescription>
            Compartilhe este link com seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <code className="rounded-lg bg-muted px-3 py-1.5 text-sm">
            vitrine.app/{slug}
          </code>
          <Button
            variant="outline"
            size="sm"
            render={
              <a href={`/${slug}`} target="_blank" rel="noreferrer" />
            }
          >
            Abrir
          </Button>
        </CardContent>
      </Card>
    </>
  )
}
