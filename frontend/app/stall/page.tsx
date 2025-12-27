'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import {
  ShoppingCart,
  Package,
  TrendingUp,
  History,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

export default function StallDashboard() {
  const quickLinks = [
    {
      title: 'Record Sale',
      description: 'Sell SKU items to customers',
      icon: ShoppingCart,
      href: '/stall/record-sale',
    },
    {
      title: 'Inventory',
      description: 'View counter stock levels',
      icon: Package,
      href: '/stall/inventory',
    },
    {
      title: 'Transfer History',
      description: 'View items received from kitchen',
      icon: TrendingUp,
      href: '/stall/transfer-history',
    },
    {
      title: 'Sales History',
      description: 'View all sales transactions',
      icon: History,
      href: '/stall/sales-history',
    },
    {
      title: 'Sales Summary',
      description: 'View sales analytics and reports',
      icon: BarChart3,
      href: '/stall/sales-summary',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Stall Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Sales recording and counter stock management for December 31st, 2025 event
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-muted flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-card-foreground mb-1">
                        {link.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                        {link.description}
                      </p>
                      <div className="flex items-center text-xs sm:text-sm text-primary font-medium">
                        Open
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Instructions */}
      <Card className="p-4 sm:p-6 mt-6 sm:mt-8 border-accent bg-accent">
        <div>
          <h3 className="font-semibold text-accent-foreground mb-2">
            Stall Operations
          </h3>
          <p className="text-sm text-accent-foreground mb-3">
            Follow these steps during the event:
          </p>
          <ol className="text-sm text-accent-foreground space-y-1 list-decimal list-inside">
            <li>Check <strong>Inventory</strong> to see current counter stock levels</li>
            <li>Use <strong>Record Sale</strong> to sell SKU items to customers</li>
            <li>View <strong>Transfer History</strong> to see items received from kitchen</li>
            <li>Check <strong>Sales History</strong> to review all transactions</li>
            <li>Use <strong>Sales Summary</strong> for analytics and reports</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
