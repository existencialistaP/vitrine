'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'
import { Store } from 'lucide-react'

import {
  criarLojaAction,
  verificarSlugAction,
} from '@/app/actions/loja'
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
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

function slugificar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const onboardingSchema = z.object({
  nome: z
    .string()
    .min(3, 'Digite o nome da sua loja (mínimo de 3 caracteres).')
    .max(60, 'O nome deve ter no máximo 60 caracteres.'),
  slug: z
    .string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Apenas letras minúsculas, números e hífens.'
    )
    .min(3, 'O endereço deve ter no mínimo 3 caracteres.')
    .max(60, 'O endereço deve ter no máximo 60 caracteres.'),
  whatsapp: z
    .string()
    .regex(/^\d+$/, 'Use apenas números (DDD + número).')
    .min(10, 'Informe DDD + número.'),
  descricao: z
    .string()
    .max(500, 'A descrição deve ter no máximo 500 caracteres.')
    .optional(),
})

type OnboardingValues = z.infer<typeof onboardingSchema>

export function OnboardingForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [slugEstado, setSlugEstado] = useState<
    'vazio' | 'verificando' | 'disponivel' | 'indisponivel'
  >('vazio')

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      nome: '',
      slug: '',
      whatsapp: '',
      descricao: '',
    },
  })

  const slug = useWatch({ control: form.control, name: 'slug' })
  const nome = useWatch({ control: form.control, name: 'nome' })

  // Gera o slug automaticamente a partir do nome quando vazio.
  useEffect(() => {
    if (!slug && nome) {
      form.setValue('slug', slugificar(nome), { shouldValidate: true })
    }
  }, [nome, slug, form])

  // Verifica a disponibilidade do slug (com debounce).
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (slug.length < 3) {
        setSlugEstado('vazio')
        return
      }
      const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
      if (!valid) {
        setSlugEstado('vazio')
        return
      }
      setSlugEstado('verificando')
      const disponivel = await verificarSlugAction(slug)
      setSlugEstado(disponivel ? 'disponivel' : 'indisponivel')
    }, 400)
    return () => clearTimeout(timer)
  }, [slug])

  async function handleSubmit(values: OnboardingValues) {
    setIsLoading(true)
    setError(null)

    try {
      const resultado = await criarLojaAction({
        nome: values.nome,
        slug: values.slug || undefined,
        whatsapp: values.whatsapp,
        descricao: values.descricao,
      })
      if (!resultado.ok) {
        setError(resultado.error)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="size-4 text-muted-foreground" aria-hidden="true" />
          Crie sua vitrine
        </CardTitle>
        <CardDescription>
          Dados básicos da sua loja. Você pode personalizar a aparência depois.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="onboarding-form"
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
                    placeholder="Ex.: Doce & Tal"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Endereço da vitrine</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="doce-e-tal"
                    aria-invalid={fieldState.invalid}
                  />
                  {slugEstado === 'verificando' && (
                    <FieldDescription>
                      Verificando disponibilidade...
                    </FieldDescription>
                  )}
                  {slugEstado === 'disponivel' && (
                    <FieldDescription className="text-success">
                      Endereço disponível.
                    </FieldDescription>
                  )}
                  {slugEstado === 'indisponivel' && (
                    <FieldDescription className="text-destructive">
                      Este endereço já está em uso.
                    </FieldDescription>
                  )}
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
                    placeholder="Ex.: 41999998888"
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
                    placeholder="Conte um pouco sobre o seu negócio."
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Não foi possível criar a vitrine</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="submit" form="onboarding-form" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {isLoading ? 'Criando...' : 'Criar minha vitrine'}
        </Button>
      </CardFooter>
    </Card>
  )
}
