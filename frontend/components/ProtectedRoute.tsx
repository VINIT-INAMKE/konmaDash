'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('admin' | 'kitchen' | 'stall')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // Not authenticated
      if (!user) {
        router.push('/login');
        return;
      }

      // Authenticated but wrong role
      if (!allowedRoles.includes(user.role)) {
        // Redirect to their appropriate dashboard
        switch (user.role) {
          case 'admin':
            router.push('/admin');
            break;
          case 'kitchen':
            router.push('/kitchen');
            break;
          case 'stall':
            router.push('/stall');
            break;
          default:
            router.push('/login');
        }
      }
    }
  }, [user, isLoading, allowedRoles, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null;
  }

  // Wrong role
  if (!allowedRoles.includes(user.role)) {
    return null;
  }

  // Authenticated and has correct role
  return <>{children}</>;
}
