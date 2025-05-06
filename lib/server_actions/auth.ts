'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { Provider } from '@supabase/supabase-js'
import { getURL } from '@/utils/helpers'

// Helper function to verify the Turnstile token
/*async function verifyTurnstileToken(token: string | null): Promise<boolean> {
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
}*/

export async function loginWithEmail(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return redirect('/login?message=Please enter both your email and password to log in.')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.includes('Invalid credentials')) {
      return redirect('/login?message=Hmm, that email and password combination doesn\'t seem right. Please double-check and try again. If you don\'t have an account, please sign up or use Google OAuth by clicking the Google icon.');
    } else if (error.message.includes('User not confirmed')) {
      return redirect('/login?message=Almost there! Please verify your account by clicking the link we sent to your email address by the name Supabase.');
    } else {
      console.error('Login error:', error.message);
      return redirect('/login?message=Oops! Something went wrong during login. Please try again in a moment.');
    }
  }

  revalidatePath('/', 'layout')
  redirect('/?loginSuccess=true');
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}

// MODIFIED signUp function
export async function signUp(formData: FormData): Promise<{ success: boolean; message?: string }> { // Added return type
  // --- Turnstile Verification Start ---
  //const token = formData.get('cf-turnstile-response') as string | null;
  //const isTokenValid = await verifyTurnstileToken(token);

  /*if (!isTokenValid) {
    console.warn('Turnstile verification failed for sign up.');
    // Instead of redirecting, return an error object
    return { success: false, message: 'CAPTCHA verification failed. Please try again.' };
  }*/
  // --- Turnstile Verification End ---

  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, message: 'Please provide both an email address and a password to sign up.' };
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('Signup error:', error.message);
    if (error.message.includes('User already registered')) {
      return { success: false, message: 'That email address is already taken. Do you already have an account? If so, please log in.' };
    } else if (error.message.includes('Password should be at least')) {
      const match = error.message.match(/Password should be at least (\d+) characters/);
      const length = match ? parseInt(match[1]) : 6; // Default to 6 if regex fails
      return { success: false, message: `Your password needs to be at least ${length} characters long. Please try a stronger password.` };
    } else if (error.message.includes('Invalid email format')) {
      return { success: false, message: 'Please enter a valid email address so we can keep in touch!' };
    }
    return { success: false, message: `We couldn't complete your signup right now. ${error.message}` };
  }

  revalidatePath('/', 'layout');
  redirect('/login?message=Success! Your account has been created. Please check your email inbox for a confirmation link from Supabase to activate your account.');
}

export async function signInWithOauth(provider: Provider) {
  if(!provider){
    return redirect('/login?message=Oops, that\'s not a valid way to sign in. Please select a valid provider.')
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
    return redirect(`/login?message=Sorry, we couldn't sign you in with ${provider} right now. Please try again.`)
  }

  return redirect(data.url)
}
