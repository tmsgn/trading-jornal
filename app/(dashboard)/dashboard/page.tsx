import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClientPage from './DashboardClientPage'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <DashboardClientPage />
}
