'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Flame, Send, Package, AlertTriangle, ArrowRight } from 'lucide-react';

export default function KitchenDashboard() {
  const quickLinks = [
    {
      title: 'Batch Cooking',
      description: 'Cook semi-processed items from raw ingredients',
      icon: Flame,
      href: '/kitchen/batch-cooking',
    },
    {
      title: 'Send to Counter',
      description: 'Transfer assembled SKUs to counter (instant update)',
      icon: Send,
      href: '/kitchen/send-to-counter',
    },
    {
      title: 'Inventory',
      description: 'View semi-processed items stock levels',
      icon: Package,
      href: '/kitchen/inventory',
    },
    {
      title: 'Alerts',
      description: 'Monitor low stock warnings',
      icon: AlertTriangle,
      href: '/kitchen/alerts',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Kitchen Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Batch cooking and counter management for December 31st, 2025 event
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
            Kitchen Operations
          </h3>
          <p className="text-sm text-accent-foreground mb-3">
            Follow these steps during the event:
          </p>
          <ol className="text-sm text-accent-foreground space-y-1 list-decimal list-inside">
            <li>Use <strong>Batch Cooking</strong> to prepare semi-processed items from raw ingredients</li>
            <li>Check <strong>Inventory</strong> to monitor semi-processed stock levels</li>
            <li>Use <strong>Send to Counter</strong> to assemble and transfer SKUs (instant update)</li>
            <li>Monitor <strong>Alerts</strong> for low stock warnings that need attention</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
