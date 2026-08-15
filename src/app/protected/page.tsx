import { redirect } from 'next/navigation'
import { Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/app-header'
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { EmptyState } from '@/components/patterns/empty-state'
import { createClient } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Painel do lojista</PageHeaderTitle>
            <PageHeaderDescription>
              Bem-vindo, {data.claims.email}. Gerencie sua loja e acompanhe seus pedidos.
            </PageHeaderDescription>
          </PageHeaderContent>
          <PageHeaderActions>
            <Button>
              <Store data-icon="inline-start" />
              Criar minha loja
            </Button>
          </PageHeaderActions>
        </PageHeader>

        <EmptyState
          icon={Store}
          title="Nenhuma loja criada ainda"
          description="Crie sua primeira vitrine digital para começar a vender pelo WhatsApp."
        />
      </main>
    </div>
  )
}
