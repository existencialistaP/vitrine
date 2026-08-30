'use client'

import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Check, Store } from 'lucide-react'
import * as z from 'zod'

import { alterarTemaAction } from '@/app/actions/loja'
import { carregarTemaAction, type TemaView } from '@/app/actions/tema'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/components/ui/toast'
import { UploadImagem } from '@/components/patterns/upload-imagem'
import { cn } from '@/lib/utils'
import {
  ESTILOS,
  FONTES,
  FORMATOS_CARD,
  LAYOUTS,
  PALETAS,
  obterFormatoCard,
  obterFonte,
  obterLayout,
  obterPaleta,
} from '@/lib/visual'
import { FormatoCard, Layout } from '@/modules/loja/domain/vos/identidade-visual'
const temaSchema = z.object({
  paleta: z.string().min(1, 'Escolha uma paleta.'),
  estilo: z.string().min(1, 'Escolha um estilo.'),
  formatoCard: z.string().min(1, 'Escolha o formato do card.'),
  layout: z.string().min(1, 'Escolha o layout.'),
  fonte: z.enum(['SANS', 'MANROPE', 'SERIF', 'DISPLAY', 'MONO']),
  logoUrl: z.string().url('Informe uma URL válida.').or(z.literal('')).optional(),
})

type TemaValues = z.infer<typeof temaSchema>

function CartaoOpcao({
  selecionado,
  aoSelecionar,
  label,
  children,
  titulo,
}: {
  selecionado: boolean
  aoSelecionar: () => void
  label: string
  children?: React.ReactNode
  titulo: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      aria-label={label}
      onClick={aoSelecionar}
      className={cn(
        'group relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left outline-none transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
        selecionado
          ? 'border-primary bg-primary/5 ring-1 ring-primary'
          : 'border-border hover:bg-muted'
      )}
    >
      {children}
      <span className="text-xs font-medium leading-tight">{titulo}</span>
      {selecionado && (
        <span
          className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-hidden="true"
        >
          <Check className="size-3" />
        </span>
      )}
    </button>
  )
}

function CartaoPaleta({
  selecionado,
  aoSelecionar,
  nome,
  corPrimaria,
  corSecundaria,
  corFundo,
}: {
  selecionado: boolean
  aoSelecionar: () => void
  nome: string
  corPrimaria: string
  corSecundaria: string
  corFundo: string
}) {
  return (
    <CartaoOpcao selecionado={selecionado} aoSelecionar={aoSelecionar} label={`Paleta ${nome}`} titulo={nome}>
      <span
        className="flex size-9 items-center rounded-full border border-border"
        style={{ backgroundColor: corFundo }}
        aria-hidden="true"
      >
        <span className="ml-1.5 h-3.5 w-3.5 rounded-full" style={{ backgroundColor: corPrimaria }} />
        <span className="ml-0.5 h-3.5 w-3.5 rounded-full" style={{ backgroundColor: corSecundaria }} />
      </span>
    </CartaoOpcao>
  )
}

function RadioFormato({ valor, label }: { valor: FormatoCard; label: string }) {
  return (
    <span className="flex w-full items-center justify-start gap-2" aria-hidden="true">
      <span className="w-10 shrink-0 overflow-hidden rounded-md border border-foreground/15 bg-muted">
        <span
          className={cn(
            'block w-full bg-muted-foreground/25',
            valor === FormatoCard.QUADRADO && 'aspect-square',
            valor === FormatoCard.RETRATO && 'aspect-[3/4]',
            valor === FormatoCard.PANORAMICO && 'aspect-[4/3]'
          )}
        />
      </span>
      <span className="text-xs">{label}</span>
    </span>
  )
}

function DiagramaLayout({ valor }: { valor: Layout }) {
  const celula = (
    <span className="h-full min-h-3 flex-1 rounded-[2px] bg-muted-foreground/25" aria-hidden="true" />
  )
  return (
    <span className="flex h-9 w-full items-stretch gap-1" aria-hidden="true">
      {valor === Layout.LISTA ? (
        <>
          {celula}
          {celula}
        </>
      ) : valor === Layout.DESTAQUE ? (
        <span className="h-full w-full rounded-[2px] bg-muted-foreground/25" />
      ) : (
        Array.from({ length: valor === Layout.GRADE_DENSA ? 3 : 2 }).map((_, i) => (
          <span key={i} className="h-full min-h-3 flex-1 rounded-[2px] bg-muted-foreground/25" />
        ))
      )}
    </span>
  )
}

function TituloGrupo({ titulo, descricao }: { titulo: string; descricao: string }) {
  return (
    <div>
      <h3 className="font-heading text-sm font-semibold tracking-tight">{titulo}</h3>
      <p className="text-sm text-muted-foreground">{descricao}</p>
    </div>
  )
}

export function TemaForm({ tema: temaInicial }: { tema?: TemaView }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [logoUrl, setLogoUrl] = useState(temaInicial?.logoUrl ?? null)

  const form = useForm<TemaValues>({
    resolver: zodResolver(temaSchema),
    defaultValues: {
      paleta: '',
      estilo: '',
      formatoCard: '',
      layout: '',
      fonte: 'SANS',
      logoUrl: '',
    },
  })

  useEffect(() => {
    let ativo = true
    carregarTemaAction()
      .then((resultado) => {
        if (!ativo) return
        if (resultado.ok) {
          form.reset({
            paleta: resultado.tema.paleta,
            estilo: resultado.tema.estilo,
            formatoCard: resultado.tema.formatoCard,
            layout: resultado.tema.layout,
            fonte: resultado.tema.fonte,
            logoUrl: resultado.tema.logoUrl ?? '',
          })
          setLogoUrl(resultado.tema.logoUrl)
        } else {
          setError(resultado.error)
        }
      })
      .finally(() => {
        if (ativo) setIsLoading(false)
      })
    return () => {
      ativo = false
    }
  }, [form])

  const paleta = useWatch({ control: form.control, name: 'paleta' })
  const formatoCard = useWatch({ control: form.control, name: 'formatoCard' })
  const layout = useWatch({ control: form.control, name: 'layout' })
  const fonte = useWatch({ control: form.control, name: 'fonte' })

  const dadosPaleta = obterPaleta(paleta)
  const cssFonte = obterFonte(fonte).css
  const previewLayout = obterLayout(layout)

  async function handleSubmit(values: TemaValues) {
    setIsSaving(true)
    setError(null)
    try {
      const resultado = await alterarTemaAction({
        paleta: values.paleta,
        estilo: values.estilo,
        formatoCard: values.formatoCard,
        layout: values.layout,
        fonte: values.fonte,
        logoUrl: values.logoUrl || null,
      })
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      setLogoUrl(values.logoUrl || null)
      toast.add({
        title: 'Aparência atualizada',
        description: 'Sua vitrine já reflete o novo visual.',
        type: 'success',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="flex flex-col gap-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Combine paleta, estilo, formato do card e layout. O visual é aplicado
            na hora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="tema-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="flex flex-col gap-8"
          >
            <FieldGroup>
              <Controller
                name="paleta"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="paleta">Paleta de cores</FieldLabel>
                    <div
                      id="paleta"
                      role="group"
                      aria-label="Paleta de cores"
                      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                    >
                      {PALETAS.map((p) => (
                        <CartaoPaleta
                          key={p.id}
                          selecionado={field.value === p.id}
                          aoSelecionar={() => field.onChange(p.id)}
                          nome={p.nome}
                          corPrimaria={p.corPrimaria}
                          corSecundaria={p.corSecundaria}
                          corFundo={p.corFundo}
                        />
                      ))}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="estilo"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="estilo">Estilo</FieldLabel>
                    <div
                      id="estilo"
                      role="group"
                      aria-label="Estilo"
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {ESTILOS.map((e) => (
                        <CartaoOpcao
                          key={e.id}
                          selecionado={field.value === e.id}
                          aoSelecionar={() => field.onChange(e.id)}
                          label={`Estilo ${e.nome}`}
                          titulo={e.nome}
                        >
                          <span className="text-[11px] text-muted-foreground">
                            {e.descricao}
                          </span>
                        </CartaoOpcao>
                      ))}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="formatoCard"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="formato-card">Formato do card</FieldLabel>
                    <div
                      id="formato-card"
                      role="group"
                      aria-label="Formato do card"
                      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
                    >
                      {FORMATOS_CARD.map((f) => (
                        <CartaoOpcao
                          key={f.id}
                          selecionado={field.value === f.id}
                          aoSelecionar={() => field.onChange(f.id)}
                          label={`Formato ${f.nome}`}
                          titulo={f.nome}
                        >
                          <RadioFormato valor={f.id} label={f.descricao} />
                        </CartaoOpcao>
                      ))}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="layout"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="layout">Layout da grade</FieldLabel>
                    <div
                      id="layout"
                      role="group"
                      aria-label="Layout da grade"
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {LAYOUTS.map((l) => (
                        <CartaoOpcao
                          key={l.id}
                          selecionado={field.value === l.id}
                          aoSelecionar={() => field.onChange(l.id)}
                          label={`Layout ${l.nome}`}
                          titulo={l.nome}
                        >
                          <DiagramaLayout valor={l.id} />
                          <span className="text-[11px] text-muted-foreground">
                            {l.descricao}
                          </span>
                        </CartaoOpcao>
                      ))}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="fonte"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="fonte">Fonte</FieldLabel>
                    <div
                      id="fonte"
                      role="group"
                      aria-label="Fonte"
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {FONTES.map((f) => (
                        <CartaoOpcao
                          key={f.id}
                          selecionado={field.value === f.id}
                          aoSelecionar={() => field.onChange(f.id)}
                          label={`Fonte ${f.nome}`}
                          titulo={f.nome}
                        >
                          <span
                            className="text-base leading-tight"
                            style={{ fontFamily: f.css }}
                          >
                            Aa
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {f.descricao}
                          </span>
                        </CartaoOpcao>
                      ))}
                    </div>
                  </Field>
                )}
              />

              <Controller
                name="logoUrl"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Logo</FieldLabel>
                    <UploadImagem
                      value={field.value || null}
                      onChange={(url) => field.onChange(url ?? '')}
                      tipo="logo"
                      descricao="Use uma imagem quadrada (ex.: 512x512), até 5 MB."
                    />
                  </Field>
                )}
              />
            </FieldGroup>

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-end border-t">
          <Button type="submit" form="tema-form" disabled={isSaving}>
            {isSaving ? <Spinner data-icon="inline-start" /> : null}
            {isSaving ? 'Salvando...' : 'Salvar aparência'}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-3">
        <TituloGrupo
          titulo="Prévia da vitrine"
          descricao="Veja como o visual escolhido aparece para os clientes."
        />
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: dadosPaleta.corFundo,
            fontFamily: cssFonte,
          }}
        >
          <div className="flex items-center justify-between gap-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="size-7 rounded-full object-cover"
              />
            ) : (
              <span
                className="inline-flex size-7 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: dadosPaleta.corPrimaria }}
                aria-hidden="true"
              >
                <Store className="size-3.5" />
              </span>
            )}
            <span className="font-heading text-sm font-semibold tracking-tight">
              Minha Loja
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: dadosPaleta.corPrimaria }}
            >
              Pedido
            </span>
          </div>

          <div className={cn('mt-4 grid gap-2', classeLayoutPreview(previewLayout.id))}>
            {Array.from({ length: 4 }).map((_, indice) => (
              <div
                key={indice}
                className="overflow-hidden rounded-lg border border-foreground/10 bg-background"
              >
                <div
                  className={cn(
                    'w-full bg-foreground/10',
                    obterFormatoCard(formatoCard).aspecto
                  )}
                >
                  <div className="flex size-full items-center justify-center text-muted-foreground">
                    <Store className="size-4" aria-hidden="true" />
                  </div>
                </div>
                <div className="p-2">
                  <div className="h-2 rounded bg-foreground/15" />
                  <div
                    className="mt-1.5 h-2 w-1/2 rounded"
                    style={{ backgroundColor: dadosPaleta.corSecundaria }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 rounded-lg px-3 py-2 text-center text-xs font-medium text-white"
            style={{ backgroundColor: dadosPaleta.corPrimaria }}
          >
            Finalizar pedido no WhatsApp
          </div>
        </div>
      </div>
    </div>
  )
}

function classeLayoutPreview(id: Layout): string {
  switch (id) {
    case Layout.LISTA:
      return 'grid-cols-1'
    case Layout.GRADE_LARGA:
      return 'grid-cols-2'
    case Layout.DESTAQUE:
      return 'grid-cols-2'
    case Layout.GRADE_DENSA:
    default:
      return 'grid-cols-2'
  }
}
