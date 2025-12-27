'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedItem } from '@/types';
import { semiProcessedItemsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/DataTable';
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

  const columns: Column<SemiProcessedItem>[] = [
    {
      header: 'Item Name',
      accessor: 'name',
      cell: (value) => <span className="font-medium">{value}</span>,
    },
    {
      header: 'Type',
      accessor: 'type',
      cell: (value) => (
        <Badge variant={value === 'batch' ? 'default' : 'secondary'}>
          {value === 'batch' ? 'Batch' : 'Fixed'}
        </Badge>
      ),
    },
    {
      header: 'Current Stock',
      accessor: 'currentStock',
      cell: (value, row) => (
        <div>
          <span className="font-semibold text-lg">
            {row.currentStock} {row.unit}
          </span>
        </div>
      ),
    },
    {
      header: 'Batches',
      accessor: 'batches',
      cell: (batches: Array<{ batchId: string; quantity: number; createdAt: string }> | undefined) => {
        if (!batches || batches.length === 0) {
          return <span className="text-muted-foreground">No batches</span>;
        }
        return (
          <div className="space-y-1">
            {batches.map((batch, idx) => (
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
        );
      },
    },
    {
      header: 'Last Updated',
      accessor: 'updatedAt',
      cell: (value) =>
        value ? (
          <span className="text-sm text-muted-foreground">
            {new Date(value).toLocaleString()}
          </span>
        ) : (
          <span>-</span>
        ),
    },
  ];

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
          <DataTable data={items} columns={columns} loading={loading} />
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
