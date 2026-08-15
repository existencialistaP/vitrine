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
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex min-h-svh flex-col md:flex-row', className)} {...props}>
      {/* Brand Visual Side (Left) */}
      <div className="relative hidden w-1/2 items-center justify-center bg-primary p-xl md:flex">
        <div className="relative z-10 max-w-lg text-primary-foreground">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-sm backdrop-blur-md">
              <Store className="size-4" />
              Capacitando microempreendedores
            </span>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight leading-tight">
            Faça seu negócio crescer com a Vitrine.
          </h1>
          <p className="mb-8 text-lg opacity-90">
            Um jeito simples e digno de gerenciar sua loja, acompanhar o crescimento e conectar-se
            com clientes em qualquer lugar.
          </p>
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <TrendingUp className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold">Acompanhamento de crescimento</p>
                <p className="text-sm opacity-80">Veja seu progresso com dados claros e visuais.</p>
              </div>
            </div>
            <div className="flex items-start gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
                <Store className="text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold">Vitrine simples</p>
                <p className="text-sm opacity-80">Digitalize seu negócio em minutos.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Side (Right) */}
      <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Brand Identity */}
          <div className="mb-8 text-center md:hidden">
            <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary">
              <Store className="size-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-primary">Vitrine</h2>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="mb-1 text-3xl font-semibold text-foreground">Bem-vindo de volta</h2>
            <p className="text-muted-foreground">Digite seus dados para gerenciar sua loja.</p>
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
      </div>
    </div>
  )
}
