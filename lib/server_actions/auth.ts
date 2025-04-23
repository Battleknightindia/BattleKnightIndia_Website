'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { getURL } from '@/utils/helpers'

// Helper function to verify the Turnstile token
async function verifyTurnstileToken(token: string | null): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!token || !secretKey) {
    console.error('Turnstile token or secret key missing.');
    return false;
  }

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
        // You might want to include remoteip: headers().get('x-forwarded-for') if needed, requires importing headers from next/headers
      }),
    });

    const data = await response.json();
    console.log('Turnstile verification response:', data); // Optional: Log for debugging
    return data.success === true;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
}

export async function loginWithEmail(formData: FormData) {
  // --- Turnstile Verification Start ---
  const token = formData.get('cf-turnstile-response') as string | null;
  const isTokenValid = await verifyTurnstileToken(token);

  if (!isTokenValid) {
    console.warn('Turnstile verification failed for login.');
    return redirect('/login?message=CAPTCHA%20verification%20failed.%20Please%20try%20again.');
  }
  // --- Turnstile Verification End ---

  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user')
  }

  revalidatePath('/', 'layout')
  redirect('/');
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

export async function signUp(formData: FormData) {
  // --- Turnstile Verification Start ---
  const token = formData.get('cf-turnstile-response') as string | null;
  const isTokenValid = await verifyTurnstileToken(token);

  if (!isTokenValid) {
    console.warn('Turnstile verification failed for sign up.');
    // Redirect back to signup, preserving other potential query params if needed, but keeping it simple here
    return redirect('/signup?message=CAPTCHA%20verification%20failed.%20Please%20try%20again.'); 
  }
  // --- Turnstile Verification End ---

  const supabase = await createClient()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }
  
  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Signup error:', error.message)
    redirect(`/login?message=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  // Redirect to a confirmation page or login after successful signup
  redirect('/login?message=Signup%20successful.%20Please%20login.') // Changed redirect on success
}

export async function signInWithOauth(provider: Provider) {
  if(!provider){
    return redirect('/login?message=Invalid%20provider')
  }
  const supabase = await createClient();
  const redirectUrl = getURL('/auth/callback')
  const {data, error} = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  })
  if (error) {
    console.error('Sign in error:', error.message)
    redirect('/login?message=Could%20not%20authenticate%20user')
  }

  return redirect(data.url)
}