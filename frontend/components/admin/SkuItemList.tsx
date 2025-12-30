'use client';

import { useState } from 'react';
import { SkuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteAlertDialog } from './DeleteAlertDialog';

interface SkuItemListProps {
  items: SkuItem[];
  loading?: boolean;
  onEdit: (item: SkuItem) => void;
  onDelete: (id: string) => void;
}

export function SkuItemList({
  items,
  loading = false,
  onEdit,
  onDelete,
}: SkuItemListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: SkuItem | null;
  }>({ open: false, item: null });
  if (loading) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        No SKU items found. Add your first SKU item to get started.
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU Name</TableHead>
          <TableHead>Counter Stock</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Low Stock Alert</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isLowStock = item.currentStallStock <= item.lowStockThreshold;
          return (
            <TableRow key={item._id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {isLowStock && (
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`font-medium ${isLowStock ? 'text-destructive' : ''}`}>
                    {item.currentStallStock}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">{item.targetSkus}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  ≤ {item.lowStockThreshold}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">₹{item.price}</TableCell>
              <TableCell>
                <Badge variant={item.isActive ? 'default' : 'secondary'}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteDialog({ open: true, item })}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

    {deleteDialog.item && (
      <DeleteAlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, item: null })}
        onConfirm={() => {
          onDelete(deleteDialog.item!._id);
          setDeleteDialog({ open: false, item: null });
        }}
        title="Delete SKU Item"
        description={`Are you sure you want to delete "${deleteDialog.item.name}"? This action cannot be undone.`}
      />
    )}
    </>
  );
}
