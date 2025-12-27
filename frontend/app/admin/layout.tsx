'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  PackageOpen,
  Layers,
  BookOpen,
  UtensilsCrossed,
  Home,
  ChevronLeft,
  Menu,
  X,
  FileText,
  Users,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

const adminLinks = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/admin/raw-ingredients',
    label: 'Raw Ingredients',
    icon: PackageOpen,
  },
  {
    href: '/admin/semi-processed-items',
    label: 'Semi-Processed Items',
    icon: Layers,
  },
  {
    href: '/admin/recipes-semi',
    label: 'Semi-Processed Recipes',
    icon: BookOpen,
  },
  {
    href: '/admin/sku-items',
    label: 'SKU Items',
    icon: UtensilsCrossed,
  },
  {
    href: '/admin/recipes-sku',
    label: 'SKU Recipes',
    icon: BookOpen,
  },
  {
    href: '/admin/activity-logs',
    label: 'Activity Logs',
    icon: FileText,
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: Users,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="flex min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">Inventory Management</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header - Desktop Only */}
        <div className="hidden lg:block p-6 border-b border-border">
          <h2 className="text-xl font-bold text-card-foreground">Admin Panel</h2>
          <p className="text-sm text-muted-foreground mt-1">Inventory Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-16 lg:mt-0 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                <div
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-2">
          {/* User Info */}
          {user && (
            <div className="px-3 py-2 rounded-lg bg-muted">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.username}</span>
              </div>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          )}

          <AnimatedThemeToggler className="w-full h-10 rounded-lg bg-muted hover:bg-accent flex items-center justify-center transition-colors" />

          <Button
            variant="outline"
            className="w-full justify-start"
            size="sm"
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>

          <Link href="/" onClick={() => setMobileMenuOpen(false)}>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
      </div>
    </ProtectedRoute>
  );
}
