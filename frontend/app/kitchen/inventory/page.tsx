'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedItem } from '@/types';
import { semiProcessedItemsApi } from '@/lib/api';
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
import { Package } from 'lucide-react';

export default function InventoryPage() {
  const [items, setItems] = useState<SemiProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    const result = await semiProcessedItemsApi.getAll();
    if (result.success && result.data) {
      setItems(result.data as SemiProcessedItem[]);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventory</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          View all semi-processed items available for assembling SKUs
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
                Semi-Processed Inventory
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                View all semi-processed items
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
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Batch Items</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {items.filter((i) => i.type === 'batch').length}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Fixed Items</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {items.filter((i) => i.type === 'fixed').length}
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
                    <TableHead>Item Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Current Stock</TableHead>
                    <TableHead>Batches</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <span className="font-medium">{item.name}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'batch' ? 'default' : 'secondary'}>
                          {item.type === 'batch' ? 'Batch' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg">
                          {item.currentStock} {item.unit}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!item.batches || item.batches.length === 0 ? (
                          <span className="text-muted-foreground">No batches</span>
                        ) : (
                          <div className="space-y-1">
                            {item.batches.map((batch, idx) => (
                              <div key={batch.batchId || idx} className="text-sm">
                                <Badge variant="outline" className="mr-2">
                                  Batch: {batch.quantity}
                                </Badge>
                                <span className="text-muted-foreground">
                                  {new Date(batch.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.updatedAt ? (
                          <span className="text-sm text-muted-foreground">
                            {new Date(item.updatedAt).toLocaleString()}
                          </span>
                        ) : (
                          <span>-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {items.length === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No semi-processed items found. Please add items in the Admin panel or
              cook batches first.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
