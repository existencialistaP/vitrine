import Link from 'next/link'
import { AlertTriangle, ArrowLeft, Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default async function Page(props: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await props.searchParams

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
          <CardHeader>
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
            </div>
            <CardTitle className="text-xl">Algo deu errado</CardTitle>
            <CardDescription>
              Ocorreu um erro durante a autenticação.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {params?.error ? (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-xs font-mono text-muted-foreground break-all">
                  {params.error}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Não foi possível completar a operação. Tente novamente ou entre em contato com o
                suporte se o problema persistir.
              </p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              className="w-full"
              render={<Link href="/auth/login" />}
            >
              <ArrowLeft data-icon="inline-start" />
              Voltar para o login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/" />}
            >
              Página inicial
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}