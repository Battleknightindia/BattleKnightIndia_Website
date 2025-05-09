'use client'

import { Provider } from '@supabase/supabase-js'
import { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { signInWithOauth } from '@/lib/server_actions/auth'

type OauthProvider = {
  name: Provider
  icon: JSX.Element
  displayName: string
}

const icons: Record<string, JSX.Element> = {
  google: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
      <path
        fill="currentColor"
        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
      />
    </svg>
  ),
  discord: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16" className="h-5 w-5 mr-2">
      <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011...Z" />
    </svg>
  ),
}

const providers: OauthProvider[] = [
  { name: 'google', icon: icons.google, displayName: 'Google' },
  { name: 'discord', icon: icons.discord, displayName: 'Discord' },
]

export function OAuthButtons() {
  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <Button
          key={provider.name}
          variant="outline"
          type="button"
          onClick={() => signInWithOauth(provider.name)}
          className="w-full bg-zinc-950 hover:bg-emerald-500 hover:text-white border-none flex items-center justify-center"
        >
          {provider.icon}
          <span>Continue with {provider.displayName}</span>
        </Button>
      ))}
    </div>
  )
}
