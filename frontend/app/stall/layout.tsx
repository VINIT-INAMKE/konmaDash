'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  ShoppingCart,
  Package,
  TrendingUp,
  History,
  BarChart3,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const stallLinks = [
  {
    href: '/stall',
    label: 'Dashboard',
    icon: Home,
  },
  {
    href: '/stall/record-sale',
    label: 'Record Sale',
    icon: ShoppingCart,
  },
  {
    href: '/stall/inventory',
    label: 'Inventory',
    icon: Package,
  },
  {
    href: '/stall/transfer-history',
    label: 'Transfer History',
    icon: TrendingUp,
  },
  {
    href: '/stall/sales-history',
    label: 'Sales History',
    icon: History,
  },
  {
    href: '/stall/sales-summary',
    label: 'Sales Summary',
    icon: BarChart3,
  },
];

export default function StallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-bold text-card-foreground">Stall/Counter</h2>
            <p className="text-xs text-muted-foreground">Sales & Stock</p>
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
          <h2 className="text-xl font-bold text-card-foreground">Stall/Counter</h2>
          <p className="text-sm text-muted-foreground mt-1">Sales & Stock</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 mt-16 lg:mt-0 overflow-y-auto">
          {stallLinks.map((link) => {
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
        <div className="p-4 border-t border-border">
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
  );
}
