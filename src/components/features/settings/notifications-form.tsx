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
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/toast'

const notificationsSchema = z.object({
  orderUpdates: z.boolean(),
  newFeatures: z.boolean(),
  marketing: z.boolean(),
})

type NotificationsValues = z.infer<typeof notificationsSchema>

type NotificationsOption = {
  name: keyof NotificationsValues
  id: string
  label: string
  description: string
}

const OPTIONS: NotificationsOption[] = [
  {
    name: 'orderUpdates',
    id: 'order-updates',
    label: 'Pedidos',
    description: 'Receba um aviso quando houver novos pedidos.',
  },
  {
    name: 'newFeatures',
    id: 'new-features',
    label: 'Novidades',
    description: 'Fique por dentro de novas funcionalidades da Vitrine.',
  },
  {
    name: 'marketing',
    id: 'marketing',
    label: 'Ofertas e dicas',
    description: 'Dicas para crescer seu negócio e novidades de planos.',
  },
]

export function NotificationsForm({ user }: { user: User }) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const initial = (user.user_metadata?.notifications as
    | Partial<NotificationsValues>
    | undefined) ?? {}

  const form = useForm<NotificationsValues>({
    resolver: zodResolver(notificationsSchema),
    defaultValues: {
      orderUpdates: initial.orderUpdates ?? true,
      newFeatures: initial.newFeatures ?? true,
      marketing: initial.marketing ?? false,
    },
  })

  async function handleSubmit(values: NotificationsValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notifications: values,
        },
      })
      if (error) throw error
      toast.add({
        title: 'Preferências salvas',
        description: 'Suas preferências de notificação foram atualizadas.',
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
        <CardTitle>Notificações</CardTitle>
        <CardDescription>
          Escolha o que você quer receber no seu e-mail.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="notifications-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FieldSet>
            <FieldLegend variant="label">Preferências</FieldLegend>
            <FieldGroup className="gap-4">
              {OPTIONS.map((option) => (
                <Controller
                  key={option.name}
                  name={option.name}
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      orientation="horizontal"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldContent>
                        <FieldLabel htmlFor={option.id}>{option.label}</FieldLabel>
                        <FieldDescription>{option.description}</FieldDescription>
                      </FieldContent>
                      <Switch
                        id={option.id}
                        name={field.name}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      />
                    </Field>
                  )}
                />
              ))}
            </FieldGroup>
          </FieldSet>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Não foi possível salvar</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
      <CardFooter className="justify-end">
        <Button type="submit" form="notifications-form" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {isLoading ? 'Salvando...' : 'Salvar preferências'}
        </Button>
      </CardFooter>
    </Card>
  )
}
