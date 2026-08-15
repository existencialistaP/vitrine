'use client'

import { useState } from 'react'
import Link from 'next/link'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { ArrowLeft, Mail, ShieldCheck, Store } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Spinner } from '@/components/ui/spinner'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Digite seu e-mail.')
    .email('Digite um e-mail válido.'),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  async function handleSubmit(values: ForgotPasswordValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-svh flex-col items-center justify-center bg-background p-6',
        className
      )}
      {...props}
    >
      <header className="mb-8 text-center">
        <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary">
          <Store className="size-7 text-primary-foreground" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">Vitrine</h1>
      </header>

      <main className="w-full max-w-md">
        {success ? (
          <Card>
            <CardContent className="flex flex-col gap-4 p-8">
              <h2 className="text-2xl font-semibold">Verifique seu e-mail</h2>
              <p className="text-muted-foreground">
                Se você se cadastrou usando seu e-mail e senha, você receberá um link para
                redefinir sua senha.
              </p>
              <div className="flex justify-center pt-2">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para o login
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-8">
              <div className="mb-8 flex flex-col gap-2">
                <h2 className="text-3xl font-semibold">Esqueceu sua senha?</h2>
                <p className="text-muted-foreground">
                  Digite o e-mail associado à sua conta Vitrine. Enviaremos um link para redefinir
                  sua senha e voltar a crescer seu negócio.
                </p>
              </div>

              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                noValidate
                className="flex flex-col gap-6"
              >
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>E-mail</FieldLabel>
                        <InputGroup>
                          <InputGroupAddon>
                            <Mail aria-hidden="true" />
                          </InputGroupAddon>
                          <InputGroupInput
                            {...field}
                            id={field.name}
                            type="email"
                            placeholder="ex.: dono@sualoja.com"
                            aria-invalid={fieldState.invalid}
                          />
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
                  {isLoading ? 'Enviando...' : 'Enviar link de redefinição'}
                </Button>
              </form>

              <div className="mt-8 border-t border-border pt-6 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline underline-offset-4"
                >
                  <ArrowLeft className="size-4" />
                  Voltar para o login
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 opacity-60">
          <ShieldCheck className="size-4 text-secondary" />
          <span className="text-sm text-muted-foreground">
            Suas informações são protegidas por criptografia padrão da indústria
          </span>
        </div>
      </main>

      <footer className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Precisa de mais ajuda?{' '}
          <a href="#" className="font-semibold text-primary hover:underline">
            Contate o suporte
          </a>
        </p>
      </footer>
    </div>
  )
}
