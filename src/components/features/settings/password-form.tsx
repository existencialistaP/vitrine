'use client'

import { useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Eye, EyeOff } from 'lucide-react'

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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'

const passwordSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

type PasswordValues = z.infer<typeof passwordSchema>

export function PasswordForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
    },
  })

  async function handleSubmit(values: PasswordValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })
      if (error) throw error
      form.reset()
      toast.add({
        title: 'Senha atualizada',
        description: 'Sua nova senha foi salva.',
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
        <CardTitle>Senha</CardTitle>
        <CardDescription>
          Defina uma nova senha para sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="password-form"
          onSubmit={form.handleSubmit(handleSubmit)}
          noValidate
        >
          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nova senha</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nova senha"
                      aria-invalid={fieldState.invalid}
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={
                          showPassword ? 'Ocultar senha' : 'Mostrar senha'
                        }
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
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
        <Button type="submit" form="password-form" disabled={isLoading}>
          {isLoading ? <Spinner data-icon="inline-start" /> : null}
          {isLoading ? 'Salvando...' : 'Atualizar senha'}
        </Button>
      </CardFooter>
    </Card>
  )
}
