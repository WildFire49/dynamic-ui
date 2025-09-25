import { NextResponse } from 'next/server';

// Define protected routes and their required permissions
const PROTECTED_ROUTES = {
  '/configurator': ['RE-20448', 'RE-20769'], // Super Admin, Admin Configurator
  '/access-control': ['RE-20448'], // Super Admin only
  '/settings': ['RE-20448'], // Super Admin only
  '/user-management': ['RE-20448'], // Super Admin only
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if the current path is a protected route
  const requiredRoles = PROTECTED_ROUTES[pathname];
  
  if (!requiredRoles) {
    // Not a protected route, continue
    return NextResponse.next();
  }

  // For protected routes, we'll let the client-side RouteGuard handle it
  // since we need to access user session data
  // This middleware can be extended for server-side validation if needed
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
