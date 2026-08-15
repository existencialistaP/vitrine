import { redirect } from 'next/navigation'

import { OnboardingForm } from '@/components/features/onboarding/onboarding-form'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import { getMinhaLoja, requireAuth } from '@/lib/loja'

export default async function OnboardingPage() {
  await requireAuth()
  const loja = await getMinhaLoja()
  if (loja) redirect('/dashboard')

  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader className="mb-2">
        <PageHeaderContent>
          <PageHeaderTitle>Monte sua vitrine</PageHeaderTitle>
          <PageHeaderDescription>
            Em poucos passos sua loja fica pronta para receber pedidos pelo
            WhatsApp.
          </PageHeaderDescription>
        </PageHeaderContent>
      </PageHeader>
      <OnboardingForm />
    </div>
  )
}
