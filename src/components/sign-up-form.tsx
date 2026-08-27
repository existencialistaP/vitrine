'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import * as z from 'zod'
import {
  ArrowRight,
  CloudCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  User,
} from 'lucide-react'

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

const signUpSchema = z.object({
  fullName: z.string().min(3, 'Digite seu nome completo.'),
  email: z
    .string()
    .min(1, 'Digite seu e-mail.')
    .email('Digite um e-mail válido.'),
  storeName: z.string().min(2, 'Digite o nome da sua loja.'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres.'),
  acceptedTerms: z
    .boolean()
    .refine((value) => value, 'Você precisa aceitar os Termos de Serviço.'),
})

type SignUpValues = z.infer<typeof signUpSchema>

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      storeName: '',
      password: '',
      acceptedTerms: false,
    },
  })

  async function handleSubmit(values: SignUpValues) {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            store_name: values.storeName,
          },
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex min-h-svh flex-col md:flex-row', className)} {...props}>
      {/* Brand/Imagery Section (Left) */}
      <section className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 md:flex md:w-1/2 md:p-12 lg:w-3/5">
        <div className="relative z-10">
          <div className="mb-8 flex items-center gap-3">
            <Store className="size-8 text-primary-foreground" />
            <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">Vitrine</h1>
          </div>
          <div className="max-w-md">
            <h2 className="mb-4 text-3xl font-semibold text-primary-foreground">
              Capacitando artesãos locais a crescerem globalmente.
            </h2>
            <p className="text-lg opacity-90">
              Junte-se a milhares de microempreendedores que simplificaram seus negócios com nossa
              plataforma intuitiva de gestão de lojas.
            </p>
          </div>
        </div>

        {/* Testimonial/Growth Badge */}
        <div className="relative z-10 max-w-sm self-start rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-bold text-primary-foreground">
                A
              </div>
              <div className="flex size-8 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-bold text-primary-foreground">
                B
              </div>
            </div>
            <span className="text-sm text-primary-foreground">+2 mil lojas entraram esta semana</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-primary-foreground/90" />
            <p className="text-sm text-primary-foreground">Em média, 15% de crescimento no primeiro mês</p>
          </div>
        </div>
      </section>

      {/* Form Section (Right) */}
      <section className="flex flex-1 flex-col justify-center bg-background px-6 py-12 md:px-12">
        {/* Mobile Header Only */}
        <div className="mb-8 flex items-center gap-2 md:hidden">
          <Store className="size-7 text-primary" />
          <span className="text-xl font-bold tracking-tight text-primary">Vitrine</span>
        </div>

        <div className="mx-auto w-full max-w-md">
          <header className="mb-8">
            <h2 className="mb-1 text-3xl font-semibold">Crie sua conta</h2>
            <p className="text-muted-foreground">Comece seu teste grátis de 14 dias hoje.</p>
          </header>

          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            noValidate
            className="flex flex-col gap-6"
          >
            <FieldGroup>
              <Controller
                name="fullName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome completo</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <User aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="Digite seu nome completo"
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
                        placeholder="nome@exemplo.com"
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
                name="storeName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nome da loja</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <ShoppingBag aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="text"
                        placeholder="Nome da sua marca"
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
                      <InputGroupAddon>
                        <Lock aria-hidden="true" />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Crie uma senha forte"
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
              name="acceptedTerms"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  className="items-start gap-3"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id="acceptedTerms"
                    name={field.name}
                    className="mt-0.5"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  />
                  <div className="flex flex-col gap-0.5">
                    <FieldLabel htmlFor="acceptedTerms" className="font-normal leading-snug text-muted-foreground">
                      Eu concordo com os{' '}
                      <Link href="#" className="font-semibold text-primary hover:underline">
                        Termos de Serviço
                      </Link>{' '}
                      e a{' '}
                      <Link href="#" className="font-semibold text-primary hover:underline">
                        Política de Privacidade
                      </Link>
                      .
                    </FieldLabel>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </div>
                </Field>
              )}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner data-icon="inline-start" /> : null}
              {isLoading ? 'Criando sua conta...' : 'Criar conta da loja'}
              {!isLoading && <ArrowRight data-icon="inline-end" />}
            </Button>
          </form>

          <footer className="mt-6 text-center">
            <p className="text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/auth/login" className="ml-1 font-bold text-primary hover:underline">
                Entrar
              </Link>
            </p>
          </footer>

          {/* Social Proof / Security */}
          <div className="mt-8 flex justify-center gap-8 border-t border-border/30 pt-6">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="size-4" />
              <span className="text-xs font-medium tracking-widest uppercase">SSL Seguro</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CloudCheck className="size-4" />
              <span className="text-xs font-medium tracking-widest uppercase">Nuvem</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
