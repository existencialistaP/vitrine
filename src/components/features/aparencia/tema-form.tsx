'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'

import { alterarTemaAction } from '@/app/actions/loja'
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'

const temaSchema = z.object({
  corPrimaria: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Cor inválida (use #RRGGBB).'),
  corSecundaria: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Cor inválida (use #RRGGBB).'),
  corFundo: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Cor inválida (use #RRGGBB).'),
  fonte: z.enum(['SANS', 'SERIF', 'MONO']),
  logoUrl: z.string().url('Informe uma URL válida.').or(z.literal('')).optional(),
})

type TemaValues = z.infer<typeof temaSchema>

type TemaView = {
  corPrimaria: string
  corSecundaria: string
  corFundo: string
  fonte: 'SANS' | 'SERIF' | 'MONO'
  logoUrl: string | null
}

const FONTES: Record<TemaValues['fonte'], string> = {
  SANS: 'var(--font-sans)',
  SERIF: "Georgia, 'Times New Roman', serif",
  MONO: 'var(--font-geist-mono)',
}

const FONTES_LABEL: Record<TemaValues['fonte'], string> = {
  SANS: 'Sem serifa (Sans)',
  SERIF: 'Serifada (Serif)',
  MONO: 'Monoespaçada (Mono)',
}

function CampoCor({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (cor: string) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-input px-3 py-2">
      <span className="text-sm font-medium">{label}</span>
      <label className="relative flex cursor-pointer items-center gap-2">
        <span
          className="size-7 rounded-md border border-border"
          style={{ backgroundColor: value }}
          aria-hidden="true"
        />
        <span className="text-sm text-muted-foreground tabular-nums">
          {value.toUpperCase()}
        </span>
        <input
          type="color"
          value={value}
          onChange={(evento) => onChange(evento.target.value)}
          className="sr-only"
          aria-label={label}
        />
      </label>
    </div>
  )
}

export function TemaForm({ tema }: { tema: TemaView }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TemaValues>({
    resolver: zodResolver(temaSchema),
    defaultValues: {
      corPrimaria: tema.corPrimaria,
      corSecundaria: tema.corSecundaria,
      corFundo: tema.corFundo,
      fonte: tema.fonte,
      logoUrl: tema.logoUrl ?? '',
    },
  })

  const corPrimaria = useWatch({ control: form.control, name: 'corPrimaria' })
  const corSecundaria = useWatch({ control: form.control, name: 'corSecundaria' })
  const corFundo = useWatch({ control: form.control, name: 'corFundo' })
  const fonte = useWatch({ control: form.control, name: 'fonte' })

  async function handleSubmit(values: TemaValues) {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await alterarTemaAction({
        corPrimaria: values.corPrimaria,
        corSecundaria: values.corSecundaria,
        corFundo: values.corFundo,
        fonte: values.fonte,
        logoUrl: values.logoUrl || null,
      })
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      toast.add({
        title: 'Aparência atualizada',
        description: 'Sua vitrine já reflete o novo visual.',
        type: 'success',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>
            Cores e fonte da sua vitrine. O tema é aplicado na hora.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id="tema-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
          >
            <FieldGroup>
              <Controller
                name="corPrimaria"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cor-primaria">Cor primária</FieldLabel>
                    <CampoCor
                      label="Botões e destaques"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="corSecundaria"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cor-secundaria">
                      Cor secundária
                    </FieldLabel>
                    <CampoCor
                      label="Detalhes e acentos"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="corFundo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cor-fundo">Cor de fundo</FieldLabel>
                    <CampoCor
                      label="Fundo da vitrine"
                      value={field.value}
                      onChange={field.onChange}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="fonte"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="fonte">Fonte</FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(valor) =>
                        field.onChange(valor ?? 'SANS')
                      }
                    >
                      <SelectTrigger
                        id="fonte"
                        className="w-full"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(FONTES_LABEL) as TemaValues['fonte'][]
                        ).map((valor) => (
                          <SelectItem key={valor} value={valor}>
                            {FONTES_LABEL[valor]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                name="logoUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>URL do logo</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="url"
                      placeholder="https://..."
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>
                      Opcional. Use uma imagem quadrada (ex.: 512x512).
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTitle>Não foi possível salvar</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" form="tema-form" disabled={isLoading}>
            {isLoading ? <Spinner data-icon="inline-start" /> : null}
            {isLoading ? 'Salvando...' : 'Salvar aparência'}
          </Button>
        </CardFooter>
      </Card>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Prévia da vitrine</p>
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: corFundo,
            fontFamily: FONTES[fonte],
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-semibold">Minha Loja</span>
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: corPrimaria }}
            >
              Pedido
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, indice) => (
              <div key={indice} className="rounded-lg border border-foreground/10 p-2">
                <div className="aspect-square rounded-md bg-foreground/10" />
                <div className="mt-2 h-2 rounded bg-foreground/15" />
                <div
                  className="mt-1 h-2 w-1/2 rounded"
                  style={{ backgroundColor: corSecundaria }}
                />
              </div>
            ))}
          </div>
          <div
            className="mt-3 rounded-lg px-3 py-2 text-center text-sm font-medium text-white"
            style={{ backgroundColor: corPrimaria }}
          >
            Finalizar pedido no WhatsApp
          </div>
        </div>
      </div>
    </div>
  )
}
