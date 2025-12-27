'use client';

import { useState, useEffect } from 'react';
import { SkuItem } from '@/types';
import { stallApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, AlertTriangle } from 'lucide-react';

export default function StallInventoryPage() {
  const [items, setItems] = useState<SkuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const result = await stallApi.getInventory();
    if (result.success && result.data) {
      setItems(result.data as SkuItem[]);
    }
    setLoading(false);
  };

  const lowStockCount = items.filter(
    (item) => item.currentStallStock <= item.lowStockThreshold
  ).length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          View current counter stock levels
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                Counter Stock
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View all SKU items at counter
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-accent rounded-lg">
              <p className="text-xs sm:text-sm text-accent-foreground mb-1">Total Items</p>
              <p className="text-xl sm:text-2xl font-bold text-accent-foreground">
                {items.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-destructive/10 rounded-lg">
              <p className="text-xs sm:text-sm text-destructive mb-1">Low Stock Items</p>
              <p className="text-xl sm:text-2xl font-bold text-destructive">
                {lowStockCount}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Active Items</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {items.filter((i) => i.isActive).length}
              </p>
            </div>
          </div>

          {/* Inventory Table */}
          {loading ? (
            <div className="w-full p-8 text-center text-muted-foreground">
              Loading inventory...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Name</TableHead>
                    <TableHead>Counter Stock</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Low Stock Alert</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const isLow = item.currentStallStock <= item.lowStockThreshold;
                    return (
                      <TableRow key={item._id}>
                        <TableCell>
                          <span className="font-medium">{item.name}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isLow && <AlertTriangle className="w-4 h-4 text-destructive" />}
                            <span className={`font-semibold text-lg ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                              {item.currentStallStock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{item.targetSkus}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            ≤ {item.lowStockThreshold}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">₹{item.price}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No SKU items found. Please add SKU items in the Admin panel first.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
