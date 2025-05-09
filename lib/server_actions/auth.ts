'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { getURL } from '@/utils/helpers'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signInWithOauth(provider: Provider) {
  if (!provider) {
    return redirect('/login?message=Oops, that\'s not a valid way to sign in. Please select a valid provider.')
  }

  const supabase = await createClient()
  const redirectUrl = getURL('/auth/callback')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  })

  if (error) {
    console.error('OAuth sign-in error:', error.message)
    return redirect(`/login?message=Sorry, we couldn't sign you in with ${provider} right now. Please try again.`)
  }

  return redirect(data.url)
}
