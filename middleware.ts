'use server';
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'; 

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)

  const supabase = await createClient(); 

  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const excludedPaths = [
    '/login',
    '/register',
    '/signup',
    '/auth/callback',
    '/complete-profile', 
    '/api',             
    // Add any other public paths or paths handled differently
  ];

  const isExcluded = excludedPaths.some(path => pathname.startsWith(path)) || 
                     config.matcher[0].includes(pathname); 

  if (user && !isExcluded) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') { //&& profileError.code !== 'PGRST116'
      console.error('Middleware profile check error:', profileError);
    } else if (!profile) {
      console.log(`Middleware: User ${user.id} missing profile, redirecting to /complete-profile from ${pathname}`);
      return NextResponse.redirect(new URL('/complete-profile', request.url))
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}