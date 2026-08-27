import Link from 'next/link'
import { ArrowRight, CheckCircle2, Mail, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary">
            <Store className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Vitrine</h1>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                <CheckCircle2 className="size-7 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <CardTitle className="text-2xl">Conta criada!</CardTitle>
            <CardDescription className="text-base">
              Confirme seu e-mail para ativar sua vitrine.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3 rounded-lg bg-muted p-4">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              <div className="text-sm text-muted-foreground">
                Enviamos um link de confirmação para o seu e-mail. Clique no link para ativar sua
                conta e começar a vender.
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Não recebeu o e-mail? Verifique a pasta de spam ou{' '}
              <Link href="/auth/login" className="text-primary hover:underline">
                tente fazer login
              </Link>
              .
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" render={<Link href="/auth/login" />}>
            <ArrowRight data-icon="inline-end" />
            Ir para o login
          </Button>
        </div>
      </div>
    </div>
  )
}