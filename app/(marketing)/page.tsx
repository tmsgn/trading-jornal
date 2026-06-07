import { createClient } from '@/utils/supabase/server'
import { LandingPage } from '@/components/marketing/LandingPage'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LandingPage />
}
