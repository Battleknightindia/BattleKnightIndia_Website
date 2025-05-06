'use server';
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { createClient } from '@/utils/supabase/server'; 

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

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
      .select('user_id, is_volunteer')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Middleware profile check error:', profileError);
    } else if (!profile) {
      console.log(`Middleware: User ${user.id} missing profile, redirecting to /complete-profile from ${pathname}`);
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    } else if (pathname.startsWith('/volunteers') && !profile.is_volunteer) {
      console.log(`Middleware: User ${user.id} is not a volunteer, access denied to /volunteers`);
      return new NextResponse('You haven\'t registered as a volunteer, therefore you are not allowed to enter.', { status: 403 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};