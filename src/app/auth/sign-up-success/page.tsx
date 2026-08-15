import { Store } from 'lucide-react'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary">
              <Store className="size-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Confirme seu e-mail</CardTitle>
            <CardDescription>Quase lá — falta um último passo.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sua conta foi criada com sucesso. Verifique sua caixa de entrada para confirmar o
              e-mail antes de entrar.
            </p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex text-sm font-medium text-primary hover:underline underline-offset-4"
            >
              Voltar para o login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
