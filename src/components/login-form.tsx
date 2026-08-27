'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import { ArrowRight, Eye, EyeOff, Store, TrendingUp } from 'lucide-react'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Digite seu e-mail.')
    .email('Digite um e-mail válido.'),
  password: z.string().min(1, 'Digite sua senha.'),
  remember: z.boolean().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  async function handleSubmit(values: LoginValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      const isCredentialError = /invalid login credentials|invalid email or password/i.test(message)
      setError(
        isCredentialError
          ? 'E-mail ou senha inválidos.'
          : 'Não foi possível entrar agora. Tente novamente.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex min-h-svh bg-muted/40', className)} {...props}>
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex lg:p-14">
        <div className="flex items-center gap-3 font-heading text-lg font-semibold">
          <span className="inline-flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15 ring-1 ring-primary-foreground/20">
            <Store aria-hidden="true" />
          </span>
          Vitrine
        </div>
        <div className="relative z-10 max-w-md">
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/70">Seu negócio, mais visível</p>
          <h1 className="font-heading text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Uma loja simples de cuidar e fácil de encontrar.
          </h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-primary-foreground/75">
            Organize produtos, personalize sua marca e compartilhe sua vitrine com clientes em poucos passos.
          </p>
          <div className="mt-10 flex items-center gap-3 border-t border-primary-foreground/20 pt-5 text-sm text-primary-foreground/75">
            <TrendingUp aria-hidden="true" />
            Cresça com clareza, no seu ritmo.
          </div>
        </div>
        <p className="text-xs text-primary-foreground/55">Feito para pequenos negócios.</p>
      </aside>

      <main className="flex w-full items-center justify-center p-5 sm:p-8 lg:w-[54%] lg:p-12">
        <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-lg shadow-primary/5 sm:p-9">
          <div className="mb-8 lg:hidden">
            <div className="flex items-center gap-2 font-heading text-lg font-semibold">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Store aria-hidden="true" /></span>
              Vitrine
            </div>
          </div>
          <div className="mb-8">
            <p className="mb-2 text-sm font-medium text-primary">Área do lojista</p>
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Entre para continuar cuidando da sua loja.</p>
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
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="email"
                        placeholder="nome@sualoja.com"
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Senha</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
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

            <Controller
              name="remember"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="gap-2.5">
                  <Checkbox
                    id="remember"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <FieldLabel htmlFor="remember" className="font-normal">
                    Lembrar de mim
                  </FieldLabel>
                </Field>
              )}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm font-medium text-primary hover:underline underline-offset-4"
              >
                Esqueceu sua senha?
              </Link>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner data-icon="inline-start" /> : null}
              {isLoading ? 'Entrando...' : 'Entrar'}
              {!isLoading && <ArrowRight data-icon="inline-end" />}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground">
              Não tem uma conta?{' '}
              <Link href="/auth/sign-up" className="font-bold text-primary hover:underline">
                Comece seu teste grátis
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
