import Link from 'next/link'
import { Store } from 'lucide-react'

const FOOTER_LINKS = {
  Produto: [
    { label: 'Funcionalidades', href: '#funcionalidades' },
    { label: 'Preços', href: '#precos' },
    { label: 'FAQ', href: '#faq' },
  ],
  Empresa: [
    { label: 'Sobre', href: '/about' },
    { label: 'Contato', href: '/contact' },
  ],
  Legal: [
    { label: 'Termos de uso', href: '#' },
    { label: 'Privacidade', href: '#' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5 font-semibold">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-3.5" aria-hidden="true" />
              </span>
              <span className="font-heading tracking-tight">Vitrine</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Simplificando a criação de lojas online para pequenos negócios.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(FOOTER_LINKS).map(([grupo, links]) => (
            <div key={grupo}>
              <h4 className="mb-3 font-heading text-sm font-semibold tracking-tight">
                {grupo}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Vitrine. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}