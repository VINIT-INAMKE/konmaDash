'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChefHat,
  Settings,
  Store,
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            QSR Inventory Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Event Inventory & Sales Management System
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            December 31st, 2025 Event
          </p>
        </div>

        {/* Role Selection */}
        <div className="max-w-5xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">
            Select Your Role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Admin Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Admin</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Setup recipes, manage inventory, configure items
                </p>
                <Link href="/admin" className="w-full">
                  <Button className="w-full">Go to Admin</Button>
                </Link>
              </div>
            </Card>

            {/* Kitchen Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                  <ChefHat className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Kitchen</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Batch cooking, send to counter, view inventory
                </p>
                <Link href="/kitchen" className="w-full">
                  <Button className="w-full">Go to Kitchen</Button>
                </Link>
              </div>
            </Card>

            {/* Stall/Counter Card */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Store className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Counter/Stall</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Record sales, view inventory, track revenue
                </p>
                <Link href="/stall" className="w-full">
                  <Button className="w-full">Go to Stall</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* System Status */}
        <div className="max-w-5xl mx-auto mt-12 p-6 bg-card rounded-lg shadow">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-muted-foreground">
              <span className="text-primary font-medium">✓</span> Backend API
              (Port 5000)
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary font-medium">✓</span> Admin
              Pages (7/7)
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary font-medium">✓</span> Kitchen
              Pages (5/5)
            </div>
            <div className="text-muted-foreground">
              <span className="text-primary font-medium">✓</span> Stall
              Pages (6/6)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
