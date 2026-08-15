'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { Eye, EyeOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
})

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  async function handleSubmit(values: UpdatePasswordValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })
      if (error) throw error
      router.push('/protected')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Definir nova senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="flex flex-col gap-6"
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

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner data-icon="inline-start" /> : null}
              {isLoading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
