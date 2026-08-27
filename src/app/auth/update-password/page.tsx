import { Store } from 'lucide-react'
import { UpdatePasswordForm } from '@/components/update-password-form'

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex size-12 items-center justify-center rounded-xl bg-primary">
            <Store className="size-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Vitrine</h1>
        </div>
        <UpdatePasswordForm />
      </div>
    </div>
  )
}
