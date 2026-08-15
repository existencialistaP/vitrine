import { Store } from "lucide-react"
import Link from "next/link"

import { LogoutButton } from "@/components/logout-button"

function AppHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/protected" className="flex items-center gap-2">
          <div className="inline-flex size-8 items-center justify-center rounded-lg bg-primary">
            <Store className="size-4 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold tracking-tight">Vitrine</span>
        </Link>
        <LogoutButton />
      </div>
    </header>
  )
}

export { AppHeader }
