'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import type { User } from '@supabase/supabase-js'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'

import { createClient } from '@/lib/supabase/client'
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
import { toast } from '@/components/ui/toast'

const profileSchema = z.object({
  fullName: z.string().min(3, 'Digite seu nome completo.'),
  email: z
    .string()
    .min(1, 'Digite seu e-mail.')
    .email('Digite um e-mail válido.'),
})

type ProfileValues = z.infer<typeof profileSchema>

export function ProfileForm({ user }: { user: User }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: (user.user_metadata?.full_name as string | undefined) ?? '',
      email: user.email ?? '',
    },
  })

  async function handleSubmit(values: ProfileValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        ...(values.email !== user.email ? { email: values.email } : {}),
        data: {
          full_name: values.fullName,
        },
      })
      if (error) throw error
      toast.add({
        title: 'Perfil atualizado',
        description: 'Suas informações foram salvas.',
        type: 'success',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
        <CardDescription>
          Atualize suas informações pessoais e o e-mail de acesso.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="profile-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="text"
                    placeholder="Seu nome"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="nome@sualoja.com"
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
              <AlertTitle>Não foi possível salvar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="submit" form="profile-form" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {isLoading ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </CardFooter>
    </Card>
  )
}
