'use client'

import type { User } from '@supabase/supabase-js'
import { Bell, KeyRound, User as UserIcon } from 'lucide-react'

import { AppHeader } from '@/components/layout/app-header'
import {
  PageHeader,
  PageHeaderContent,
  PageHeaderDescription,
  PageHeaderTitle,
} from '@/components/layout/page-header'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'

import { NotificationsForm } from './notifications-form'
import { PasswordForm } from './password-form'
import { ProfileForm } from './profile-form'

export function SettingsTabs({ user }: { user: User }) {
  return (
    <div className="flex min-h-svh flex-col">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <PageHeader>
          <PageHeaderContent>
            <PageHeaderTitle>Configurações</PageHeaderTitle>
            <PageHeaderDescription>
              Gerencie seu perfil, senha e preferências de notificação.
            </PageHeaderDescription>
          </PageHeaderContent>
        </PageHeader>

        <Tabs defaultValue="perfil">
          <TabsList>
            <TabsTrigger value="perfil">
              <UserIcon aria-hidden="true" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="senha">
              <KeyRound aria-hidden="true" />
              Senha
            </TabsTrigger>
            <TabsTrigger value="notificacoes">
              <Bell aria-hidden="true" />
              Notificações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil" className="pt-2">
            <ProfileForm user={user} />
          </TabsContent>
          <TabsContent value="senha" className="pt-2">
            <PasswordForm />
          </TabsContent>
          <TabsContent value="notificacoes" className="pt-2">
            <NotificationsForm user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
