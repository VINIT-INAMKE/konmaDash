'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  PackageOpen,
  Layers,
  BookOpen,
  UtensilsCrossed,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import {
  rawIngredientsApi,
  semiProcessedItemsApi,
  skuItemsApi,
  semiProcessedRecipesApi,
  skuRecipesApi,
} from '@/lib/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    rawIngredients: 0,
    semiProcessedItems: 0,
    skuItems: 0,
    semiRecipes: 0,
    skuRecipes: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const [raw, semi, sku, semiRecipe, skuRecipe] = await Promise.all([
      rawIngredientsApi.getAll(),
      semiProcessedItemsApi.getAll(),
      skuItemsApi.getAll(),
      semiProcessedRecipesApi.getAll(),
      skuRecipesApi.getAll(),
    ]);

    setStats({
      rawIngredients: (raw.data && Array.isArray(raw.data)) ? raw.data.length : 0,
      semiProcessedItems: (semi.data && Array.isArray(semi.data)) ? semi.data.length : 0,
      skuItems: (sku.data && Array.isArray(sku.data)) ? sku.data.length : 0,
      semiRecipes: (semiRecipe.data && Array.isArray(semiRecipe.data)) ? semiRecipe.data.length : 0,
      skuRecipes: (skuRecipe.data && Array.isArray(skuRecipe.data)) ? skuRecipe.data.length : 0,
    });
    setLoading(false);
  };

  const quickLinks = [
    {
      title: 'Raw Ingredients',
      description: 'Manage raw inventory items',
      icon: PackageOpen,
      href: '/admin/raw-ingredients',
      count: stats.rawIngredients,
    },
    {
      title: 'Semi-Processed Items',
      description: 'Batch and fixed items',
      icon: Layers,
      href: '/admin/semi-processed-items',
      count: stats.semiProcessedItems,
    },
    {
      title: 'Semi-Processed Recipes',
      description: 'Raw → Semi recipes',
      icon: BookOpen,
      href: '/admin/recipes-semi',
      count: stats.semiRecipes,
    },
    {
      title: 'SKU Items',
      description: 'Menu SKU items',
      icon: UtensilsCrossed,
      href: '/admin/sku-items',
      count: stats.skuItems,
    },
    {
      title: 'SKU Recipes',
      description: 'Semi → SKU recipes',
      icon: BookOpen,
      href: '/admin/recipes-sku',
      count: stats.skuRecipes,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Manage inventory, recipes, and SKU items for December 31st, 2025 event
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total Raw Ingredients</p>
              <p className="text-2xl sm:text-3xl font-bold text-card-foreground mt-1">
                {loading ? '-' : stats.rawIngredients}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <PackageOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Semi-Processed Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-card-foreground mt-1">
                {loading ? '-' : stats.semiProcessedItems}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Menu SKU Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-card-foreground mt-1">
                {loading ? '-' : stats.skuItems}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Setup Progress */}
      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Setup Progress</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Raw Ingredients Added</span>
            <span className="text-sm font-medium">
              {stats.rawIngredients > 0 ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Semi-Processed Items Added
            </span>
            <span className="text-sm font-medium">
              {stats.semiProcessedItems > 0 ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Semi-Processed Recipes Created
            </span>
            <span className="text-sm font-medium">
              {stats.semiRecipes > 0 ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">SKU Items Added</span>
            <span className="text-sm font-medium">
              {stats.skuItems > 0 ? '✓ Complete' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">SKU Recipes Created</span>
            <span className="text-sm font-medium">
              {stats.skuRecipes > 0 ? '✓ Complete' : 'Pending'}
            </span>
          </div>
        </div>
      </Card>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
          Quick Access
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="p-4 sm:p-5 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-muted">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xl sm:text-2xl font-bold text-card-foreground">
                      {link.count}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-card-foreground mb-1">
                    {link.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                    {link.description}
                  </p>
                  <div className="flex items-center text-xs sm:text-sm text-primary font-medium">
                    Manage
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Getting Started Guide */}
      {stats.rawIngredients === 0 && (
        <Card className="p-4 sm:p-6 mt-6 sm:mt-8 border-accent bg-accent">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-accent-foreground mb-2">
                Getting Started
              </h3>
              <p className="text-sm text-accent-foreground mb-3">
                Start by setting up your inventory in the following order:
              </p>
              <ol className="text-sm text-accent-foreground space-y-1 list-decimal list-inside">
                <li>Add Raw Ingredients (chicken, masala, cheese, etc.)</li>
                <li>Add Semi-Processed Items (gravies, danish, croissants)</li>
                <li>
                  Create Semi-Processed Recipes (how to cook gravies from raw
                  ingredients)
                </li>
                <li>Add SKU Items (menu items like Butter Chicken Danish)</li>
                <li>
                  Create SKU Recipes (how to assemble SKUs from semi-processed
                  items)
                </li>
              </ol>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
