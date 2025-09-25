'use client';

import { usePathname } from 'next/navigation';
import RouteGuard from '../components/auth/RouteGuard';
import { ROUTE_ACCESS } from '../config/roleConfig';

/**
 * Client-side layout wrapper that applies route protection based on pathname
 */
export default function LayoutClient({ children }) {
  const pathname = usePathname();
  
  // Define which routes need protection
  const protectedRoutes = {
    '/configurator': 'configurator',
    '/access-control': 'accessControl', 
    '/settings': 'settings',
    '/user-management': 'userManagement',
    // Add more protected routes here
  };

  // Check if current route needs protection
  const routeId = protectedRoutes[pathname];
  
  if (routeId) {
    return (
      <RouteGuard routeId={routeId}>
        {children}
      </RouteGuard>
    );
  }

  // For non-protected routes, render children directly
  return <>{children}</>;
}
