'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import {
  adicionarProdutoAction,
  atualizarProdutoAction,
} from '@/app/actions/loja'
import { Button } from '@/components/ui/button'
import {
  Field,
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/toast'

type ProdutoView = {
  id: string
  nome: string
  descricao: string
  precoCents: number
  categoriaId: string | null
  imagemUrl: string | null
  disponivel: boolean
}

type CategoriaView = { id: string; nome: string }

function reaisParaCents(valor: string): number {
  const numerico = Number.parseFloat(valor.replace(',', '.'))
  if (Number.isNaN(numerico) || numerico < 0) return 0
  return Math.round(numerico * 100)
}

const produtoSchema = z.object({
  nome: z
    .string()
    .min(2, 'Digite o nome do produto.')
    .max(80, 'O nome deve ter no máximo 80 caracteres.'),
  descricao: z
    .string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .optional(),
  preco: z
    .string()
    .min(1, 'Informe o preço.')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido. Ex.: 12,50'),
  categoriaId: z.string().nullable().optional(),
  imagemUrl: z
    .string()
    .url('Informe uma URL válida.')
    .or(z.literal(''))
    .optional(),
  disponivel: z.boolean(),
})

type ProdutoValues = z.infer<typeof produtoSchema>

export function ProdutoForm({
  categorias,
  produto,
  onSucesso,
}: {
  categorias: CategoriaView[]
  produto?: ProdutoView
  onSucesso: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProdutoValues>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      nome: produto?.nome ?? '',
      descricao: produto?.descricao ?? '',
      preco: produto
        ? (produto.precoCents / 100).toFixed(2).replace('.', ',')
        : '',
      categoriaId: produto?.categoriaId ?? null,
      imagemUrl: produto?.imagemUrl ?? '',
      disponivel: produto?.disponivel ?? true,
    },
  })

  async function handleSubmit(values: ProdutoValues) {
    setIsLoading(true)
    try {
      const base = {
        nome: values.nome,
        descricao: values.descricao || undefined,
        precoCents: reaisParaCents(values.preco),
        categoriaId: values.categoriaId || null,
        imagemUrl: values.imagemUrl || null,
      }

      const resultado = produto
        ? await atualizarProdutoAction({ ...base, produtoId: produto.id })
        : await adicionarProdutoAction({ ...base, disponivel: values.disponivel })

      if (!resultado.ok) {
        toast.add({
          title: 'Não foi possível salvar',
          description: resultado.error,
          type: 'error',
        })
        return
      }

      toast.add({
        title: produto ? 'Produto atualizado' : 'Produto criado',
        description: 'As alterações foram salvas.',
        type: 'success',
      })
      onSucesso()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      id="produto-form"
      onSubmit={form.handleSubmit(handleSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <FieldGroup>
        <Controller
          name="nome"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="Ex.: Brigadeiro Gourmet"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
                placeholder="Detalhes do produto..."
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="preco"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Preço (R$)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="text"
                  inputMode="decimal"
                  placeholder="12,50"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="categoriaId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="categoria">Categoria</FieldLabel>
                <Select
                  name="categoria"
                  value={field.value ?? ''}
                  onValueChange={(valor) => field.onChange(valor || null)}
                >
                  <SelectTrigger
                    id="categoria"
                    className="w-full"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem categoria</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
        </div>

        <Controller
          name="imagemUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL da imagem</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="url"
                placeholder="https://..."
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="disponivel"
          control={form.control}
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel htmlFor="disponivel" className="font-normal">
                Disponibilizar na vitrine
              </FieldLabel>
              <Switch
                id="disponivel"
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {isLoading ? 'Salvando...' : 'Salvar produto'}
        </Button>
      </div>
    </form>
  )
}
