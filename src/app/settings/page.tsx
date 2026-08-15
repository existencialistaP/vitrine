import { redirect } from 'next/navigation'

import { SettingsTabs } from '@/components/features/settings/settings-tabs'
import { createClient } from '@/lib/supabase/server'

export default async function SettingsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    redirect('/auth/login')
  }

  return <SettingsTabs user={data.user} />
}
