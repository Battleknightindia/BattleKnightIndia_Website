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
  // ... (loginWithEmail function remains the same)
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?message=Could not authenticate user verify yourself using the link given in your email')
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

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    console.error('Signup error:', error.message);
    // Return error object instead of redirecting
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout');
  // On success, you might still want to redirect, for example, to a login page
  // or a confirmation page. If you want to handle success client-side,
  // return success: true and manage the redirect in the client component.
  // For this example, let's assume we still redirect to login on success.
  redirect('/login?message=Signup%20successful.%20Please%20check%20your%20email%20for%20comfirmation%20link%20from%20Supabase.');

  // If you prefer to handle success fully client-side without immediate redirect:
  // return { success: true }; // And handle the redirect in SignUpForm.tsx
}

export async function signInWithOauth(provider: Provider) {
  // ... (signInWithOauth function remains the same)
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
