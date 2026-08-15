'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import { alterarDadosLojaAction } from '@/app/actions/loja'
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui/toggle-group'
import { toast } from '@/components/ui/toast'

const schema = z.object({
  nome: z
    .string()
    .min(3, 'O nome deve ter no mínimo 3 caracteres.')
    .max(60, 'O nome deve ter no máximo 60 caracteres.'),
  whatsapp: z
    .string()
    .regex(/^\d+$/, 'Use apenas números (DDD + número).')
    .min(10, 'Informe DDD + número.'),
  descricao: z
    .string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .optional(),
  status: z.enum(['ATIVA', 'INATIVA']),
})

type Values = z.infer<typeof schema>

export function LojaConfigForm({
  dados,
}: {
  dados: {
    nome: string
    whatsapp: string
    descricao: string
    status: 'ATIVA' | 'INATIVA'
  }
}) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: dados.nome,
      whatsapp: dados.whatsapp,
      descricao: dados.descricao,
      status: dados.status,
    },
  })

  async function handleSubmit(values: Values) {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await alterarDadosLojaAction({
        nome: values.nome,
        descricao: values.descricao ?? '',
        whatsapp: values.whatsapp,
        status: values.status,
      })
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      toast.add({
        title: 'Dados salvos',
        description: 'As informações da loja foram atualizadas.',
        type: 'success',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados da loja</CardTitle>
        <CardDescription>
          Nome, contato e status da sua vitrine.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="loja-config-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="nome"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome da loja</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="whatsapp"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    WhatsApp (DDD + número)
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="tel"
                    inputMode="numeric"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="descricao"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={3}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldLabel htmlFor="status">Status da vitrine</FieldLabel>
                  <ToggleGroup
                    id="status"
                    spacing={1}
                    value={[field.value]}
                    onValueChange={(valores) => {
                      if (valores[0]) field.onChange(valores[0])
                    }}
                  >
                    <ToggleGroupItem value="ATIVA">Ativa</ToggleGroupItem>
                    <ToggleGroupItem value="INATIVA">Inativa</ToggleGroupItem>
                  </ToggleGroup>
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
        <Button type="submit" form="loja-config-form" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {isLoading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </CardFooter>
    </Card>
  )
}
