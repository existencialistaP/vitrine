'use client'

import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, X } from 'lucide-react'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { UploadImagem } from '@/components/patterns/upload-imagem'
import { propSchemas, type BlocoExperiencia, type BlockType } from '@/lib/experience'

type CampoUI =
  | { chave: string; tipo: 'texto' | 'textoLongo' | 'numero' | 'boolean'; label: string }
  | { chave: string; tipo: 'select'; label: string; opcoes: readonly { valor: string; nome: string }[] }
  | { chave: string; tipo: 'imagem' | 'produtos' | 'categorias'; label: string }

const OPCOES = {
  alinhamento: [
    { valor: 'left', nome: 'À esquerda' },
    { valor: 'center', nome: 'Centralizado' },
  ],
  ladoImagem: [
    { valor: 'right', nome: 'Texto à esquerda' },
    { valor: 'left', nome: 'Imagem à esquerda' },
  ],
  modo: [
    { valor: 'hybrid', nome: 'Automático + selecionados' },
    { valor: 'manual', nome: 'Somente selecionados' },
    { valor: 'automatic', nome: 'Somente automático' },
  ],
  ordem: [
    { valor: 'newest', nome: 'Mais recentes' },
    { valor: 'priceAsc', nome: 'Menor preço' },
    { valor: 'priceDesc', nome: 'Maior preço' },
    { valor: 'name', nome: 'Nome (A-Z)' },
  ],
} as const

function camposPara(tipo: BlockType): CampoUI[] {
  switch (tipo) {
    case 'hero':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'description', tipo: 'textoLongo', label: 'Descrição' },
        { chave: 'action', tipo: 'texto', label: 'Texto do botão' },
        { chave: 'buttonVisible', tipo: 'boolean', label: 'Mostrar botão' },
      ]
    case 'richText':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'align', tipo: 'select', label: 'Alinhamento', opcoes: OPCOES.alinhamento },
        { chave: 'body', tipo: 'textoLongo', label: 'Conteúdo' },
      ]
    case 'imageText':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'imageSide', tipo: 'select', label: 'Posição da imagem', opcoes: OPCOES.ladoImagem },
        { chave: 'body', tipo: 'textoLongo', label: 'Texto' },
        { chave: 'imageUrl', tipo: 'imagem', label: 'Imagem' },
      ]
    case 'productCollection':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'mode', tipo: 'select', label: 'Modo de seleção', opcoes: OPCOES.modo },
        { chave: 'categoryId', tipo: 'categorias', label: 'Filtrar por categoria' },
        { chave: 'manualIds', tipo: 'produtos', label: 'Produtos selecionados' },
        { chave: 'order', tipo: 'select', label: 'Ordenar por', opcoes: OPCOES.ordem },
        { chave: 'limit', tipo: 'numero', label: 'Limite de produtos' },
      ]
    case 'categoryCollection':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'limit', tipo: 'numero', label: 'Limite de categorias' },
      ]
    case 'about':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'body', tipo: 'textoLongo', label: 'Conteúdo' },
      ]
    case 'banner':
    case 'cta':
      return [
        { chave: 'title', tipo: 'texto', label: 'Título' },
        { chave: 'description', tipo: 'textoLongo', label: 'Descrição' },
        { chave: 'action', tipo: 'texto', label: 'Texto do botão' },
      ]
    case 'testimonials':
    case 'faq':
    case 'gallery':
      return [{ chave: 'title', tipo: 'texto', label: 'Título' }]
    case 'spacer':
      return [{ chave: 'height', tipo: 'numero', label: 'Altura (px)' }]
    case 'divider':
    default:
      return []
  }
}

function edicaoDeLista(tipo: BlockType): {
  chave: 'items' | 'images'
  tipoItens: 'objeto' | 'texto'
  rotulo: string
  campos?: { chave: string; placeholder: string; area?: boolean }[]
  novoItem: unknown
} | null {
  if (tipo === 'testimonials')
    return {
      chave: 'items',
      tipoItens: 'objeto',
      rotulo: 'Depoimentos',
      campos: [
        { chave: 'nome', placeholder: 'Nome do cliente' },
        { chave: 'texto', placeholder: 'Depoimento', area: true },
      ],
      novoItem: { nome: '', texto: '' },
    }
  if (tipo === 'faq')
    return {
      chave: 'items',
      tipoItens: 'objeto',
      rotulo: 'Perguntas frequentes',
      campos: [
        { chave: 'pergunta', placeholder: 'Pergunta', area: true },
        { chave: 'resposta', placeholder: 'Resposta' },
      ],
      novoItem: { pergunta: '', resposta: '' },
    }
  if (tipo === 'gallery')
    return {
      chave: 'images',
      tipoItens: 'texto',
      rotulo: 'Imagens da galeria (URLs)',
      novoItem: '',
    }
  return null
}

function ListaEditor({
  definicao,
  valor,
  onAtualizar,
}: {
  definicao: NonNullable<ReturnType<typeof edicaoDeLista>>
  valor: unknown
  onAtualizar: (itensNovos: unknown[]) => void
}) {
  const itens = Array.isArray(valor) ? (valor as Record<string, unknown>[]) : []

  function atualizar(itensNovos: unknown[]) {
    onAtualizar(itensNovos)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">{definicao.rotulo}</p>
      {definicao.tipoItens === 'texto' ? (
        (itens as unknown[]).map((_, indice) => (
          <div key={indice} className="flex items-center gap-2">
            <Input
              value={String(itens[indice] ?? '')}
              aria-label={`URL da imagem ${indice + 1}`}
              placeholder="https://..."
              onChange={(e) =>
                atualizar(itens.map((item, i) => (i === indice ? e.target.value : item)))
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remover imagem"
              onClick={() => atualizar(itens.filter((_, i) => i !== indice))}
            >
              <X />
            </Button>
          </div>
        ))
      ) : (
        itens.map((item, indice) => (
          <div key={indice} className="flex flex-col gap-2 rounded-lg border p-3">
            {(definicao.campos ?? []).map((campoItem) => (
              <label key={campoItem.chave} className="flex flex-col gap-1 text-sm">
                {campoItem.area ? (
                  <Textarea
                    placeholder={campoItem.placeholder}
                    value={String(item[campoItem.chave] ?? '')}
                    aria-label={campoItem.placeholder}
                    onChange={(e) =>
                      atualizar(
                        itens.map((itemAtual, i) =>
                          i === indice ? { ...itemAtual, [campoItem.chave]: e.target.value } : itemAtual
                        )
                      )
                    }
                  />
                ) : (
                  <Input
                    placeholder={campoItem.placeholder}
                    value={String(item[campoItem.chave] ?? '')}
                    aria-label={campoItem.placeholder}
                    onChange={(e) =>
                      atualizar(
                        itens.map((itemAtual, i) =>
                          i === indice ? { ...itemAtual, [campoItem.chave]: e.target.value } : itemAtual
                        )
                      )
                    }
                  />
                )}
              </label>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="self-start"
              onClick={() => atualizar(itens.filter((_, i) => i !== indice))}
            >
              <X data-icon="inline-start" />Remover
            </Button>
          </div>
        ))
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="justify-start"
        onClick={() => atualizar([...itens, definicao.novoItem])}
      >
        <Plus data-icon="inline-start" />Adicionar
      </Button>
    </div>
  )
}

export function BlockForm({
  bloco,
  onChange,
  onLabelChange,
  produtos,
  categorias,
}: {
  bloco: BlocoExperiencia
  onChange: (props: Record<string, unknown>) => void
  onLabelChange: (label: string) => void
  produtos: { id: string; nome: string }[]
  categorias: { id: string; nome: string }[]
}) {
  const schema = z.object({
    label: z.string().min(1, 'Nome é obrigatório'),
    ...((propSchemas[bloco.type] as z.ZodObject<z.ZodRawShape>).shape),
  })

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { label: bloco.label, ...bloco.props },
  })

  function propagar() {
    const valores = form.getValues()
    const { label, ...props } = valores
    onChange(props)
    onLabelChange(String(label))
  }

  const campos = camposPara(bloco.type)
  const lista = edicaoDeLista(bloco.type)
  const errors = form.formState.errors as Record<string, { message?: string; type?: string }>
  const valido = schema.safeParse(form.watch()).success

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel>Nome do bloco</FieldLabel>
          <Controller
            name={'label' as const}
            control={form.control}
            render={({ field }) => (
              <>
                <Input
                  value={typeof field.value === 'string' ? field.value : ''}
                  onChange={(e) => {
                    field.onChange(e.target.value)
                    propagar()
                  }}
                  placeholder="Nome exibido no construtor"
                />
                <FieldError>{errors.label?.message}</FieldError>
              </>
            )}
          />
        </Field>

        {campos.map((campo) => (
          <Controller
            key={campo.chave}
            name={campo.chave as 'label'}
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>{campo.label}</FieldLabel>
                {campo.tipo === 'texto' && (
                  <Input
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      propagar()
                    }}
                  />
                )}
                {campo.tipo === 'textoLongo' && (
                  <Textarea
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      propagar()
                    }}
                  />
                )}
                {campo.tipo === 'numero' && (
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={typeof field.value === 'number' ? field.value : ''}
                    onChange={(e) => {
                      const n = e.target.valueAsNumber
                      field.onChange(Number.isNaN(n) ? undefined : n)
                      propagar()
                    }}
                  />
                )}
                {campo.tipo === 'boolean' && (
                  <Switch
                    checked={(field.value as unknown) === true || field.value === 'true'}
                    onCheckedChange={(v) => {
                      field.onChange(v)
                      propagar()
                    }}
                  />
                )}
                {campo.tipo === 'select' && (
                  <Select
                    value={String(field.value ?? '')}
                    onValueChange={(v) => {
                      field.onChange(v)
                      propagar()
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {campo.opcoes.map((opcao) => (
                        <SelectItem key={opcao.valor} value={opcao.valor}>
                          {opcao.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {campo.tipo === 'imagem' && (
                  <UploadImagem
                    tipo="produto"
                    label="Enviar imagem"
                    value={typeof field.value === 'string' ? field.value : null}
                    onChange={(url) => {
                      field.onChange(url)
                      propagar()
                    }}
                  />
                )}
                {campo.tipo === 'categorias' && (
                  <Select
                    value={typeof field.value === 'string' ? field.value : 'todas'}
                    onValueChange={(v) => {
                      field.onChange(v === 'todas' ? null : v)
                      propagar()
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Todas as categorias" />
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
                )}
                {campo.tipo === 'produtos' && (
                  <div className="flex flex-wrap gap-2" role="group" aria-label={campo.label}>
                    {produtos.map((produto) => {
                      const selecionados = Array.isArray(field.value)
                        ? (field.value as string[])
                        : []
                      const ativo = selecionados.includes(produto.id)
                      return (
                        <Button
                          key={produto.id}
                          type="button"
                          variant={ativo ? 'default' : 'outline'}
                          size="sm"
                          aria-pressed={ativo}
                          onClick={() => {
                            const proximos = ativo
                              ? selecionados.filter((id) => id !== produto.id)
                              : [...selecionados, produto.id]
                            field.onChange(proximos)
                            propagar()
                          }}
                        >
                          {produto.nome}
                        </Button>
                      )
                    })}
                  </div>
                )}
                <FieldError>{errors[campo.chave]?.message}</FieldError>
              </Field>
            )}
          />
        ))}
      </FieldGroup>

      {lista && (
        <ListaEditor
          definicao={lista}
          valor={form.watch(lista.chave as 'label')}
          onAtualizar={(itensNovos) => {
            form.setValue(lista.chave as 'label', itensNovos as unknown as never, {
              shouldValidate: true,
              shouldDirty: false,
            })
            propagar()
          }}
        />
      )}

      {!valido && (
        <FieldError>Revise os campos: há valores inválidos.</FieldError>
      )}
    </div>
  )
}