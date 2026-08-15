import { Store } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/patterns/empty-state"

export default function VitrineNotFound() {
  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <EmptyState
        icon={Store}
        title="Vitrine não encontrada"
        description="O link que você acessou não existe ou a vitrine está indisponível no momento."
        action={
          <Button render={<Link href="/" />}>Voltar para a página inicial</Button>
        }
      />
    </div>
  )
}
