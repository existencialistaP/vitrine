'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ExternalLink,
  LayoutDashboard,
  Package,
  Palette,
  Settings,
  Store,
  Tags,
} from 'lucide-react'

import { LogoutButton } from '@/components/logout-button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarRail,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

const ITENS: NavItem[] = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/dashboard/produtos', label: 'Produtos', icon: Package },
  { href: '/dashboard/categorias', label: 'Categorias', icon: Tags },
  { href: '/dashboard/aparencia', label: 'Aparência', icon: Palette },
  { href: '/dashboard/configuracoes', label: 'Configurações', icon: Settings },
]

export function AppSidebar({
  variant = 'sidebar',
  slug,
  lojaNome,
}: {
  variant?: 'sidebar' | 'floating' | 'inset'
  slug?: string
  lojaNome?: string
}) {
  const pathname = usePathname()

  function estaAtivo(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <Sidebar collapsible="offcanvas" variant={variant}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              isActive={estaAtivo('/dashboard')}
              className="gap-3"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" aria-hidden="true" />
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate font-semibold">Vitrine</span>
                {lojaNome && (
                  <span className="truncate text-xs text-muted-foreground">
                    {lojaNome}
                  </span>
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciar</SidebarGroupLabel>
          <SidebarMenu>
            {ITENS.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={estaAtivo(item.href)}
                >
                  <item.icon aria-hidden={true} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {slug && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Vitrine pública</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={
                      <a
                        href={`/${slug}`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    <ExternalLink aria-hidden="true" />
                    <span>Ver vitrine</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}