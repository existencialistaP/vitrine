import Link from 'next/link'
import { Copy, ExternalLink, Package, Sparkles, Store, Tags, TrendingUp } from 'lucide-react'

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
  const nome = loja.getNome().getValue()
  const totalDisponiveis = produtos.filter((p) => p.getDisponibilidade().isDisponivel()).length

  return (
    <>
      {/* Welcome section */}
      <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">
              Bem-vindo de volta 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              {nome} — tudo pronto para vender.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {ativa ? (
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Sparkles className="size-3" aria-hidden="true" />
                Vitrine ativa
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1">
                Vitrine inativa
              </Badge>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              render={
                <a href={`/${slug}`} target="_blank" rel="noreferrer" />
              }
            >
              <ExternalLink className="size-3.5" aria-hidden="true" />
              Ver vitrine
            </Button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-primary/40" aria-hidden="true" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="size-4 text-primary/60" aria-hidden="true" />
              Produtos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold tabular-nums">
                {produtos.length}
              </span>
              <span className="text-sm text-muted-foreground">itens</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="flex h-1.5 w-full max-w-24 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: produtos.length > 0
                      ? `${(totalDisponiveis / produtos.length) * 100}%`
                      : '0%',
                  }}
                />
              </div>
              <span>{totalDisponiveis} disponíveis</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-emerald-400/60" aria-hidden="true" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tags className="size-4 text-emerald-500/60" aria-hidden="true" />
              Categorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-bold tabular-nums">
                {categorias.length}
              </span>
              <span className="text-sm text-muted-foreground">grupos</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Organizam os produtos na vitrine
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute left-0 top-0 h-full w-1 bg-amber-400/60" aria-hidden="true" />
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="size-4 text-amber-500/60" aria-hidden="true" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <Badge variant={ativa ? 'secondary' : 'destructive'} className="text-sm font-medium">
                {ativa ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {ativa
                ? 'Sua vitrine está visível ao público.'
                : 'Sua vitrine está oculta.'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* URL card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-4 text-muted-foreground" aria-hidden="true" />
            Endereço da sua vitrine
          </CardTitle>
          <CardDescription>
            Compartilhe este link com seus clientes para eles verem seus produtos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <Store className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
              <span className="font-mono">vitrine.app/{slug}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                render={
                  <a href={`/${slug}`} target="_blank" rel="noreferrer" />
                }
              >
                <ExternalLink className="size-3.5" aria-hidden="true" />
                Abrir
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/produtos"
          className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <Package className="size-4" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">Gerenciar produtos</span>
            <span className="text-xs text-muted-foreground">Adicionar, editar, organizar</span>
          </div>
        </Link>

        <Link
          href="/dashboard/aparencia"
          className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white dark:text-emerald-400">
            <PaletteIcon className="size-4" aria-hidden={true} />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">Personalizar visual</span>
            <span className="text-xs text-muted-foreground">Cores, layout, fonte</span>
          </div>
        </Link>

        <Link
          href="/dashboard/configuracoes"
          className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white dark:text-amber-400">
            <SettingsIcon className="size-4" aria-hidden={true} />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">Configurações</span>
            <span className="text-xs text-muted-foreground">Dados da loja, WhatsApp</span>
          </div>
        </Link>

        <Link
          href={`/${slug}`}
          target="_blank"
          className="group flex items-center gap-3 rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ExternalLink className="size-4" aria-hidden="true" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-sm font-medium">Ver vitrine</span>
            <span className="text-xs text-muted-foreground">Visualizar como cliente</span>
          </div>
        </Link>
      </div>
    </>
  )
}

function PaletteIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden={props['aria-hidden']}
    >
      <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-4.97-4.48-9-10-9z" />
    </svg>
  )
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden={props['aria-hidden']}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
