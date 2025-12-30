'use client';

import { useState } from 'react';
import { SemiProcessedItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteAlertDialog } from './DeleteAlertDialog';

interface SemiProcessedItemListProps {
  items: SemiProcessedItem[];
  loading?: boolean;
  onEdit: (item: SemiProcessedItem) => void;
  onDelete: (id: string) => void;
}

export function SemiProcessedItemList({
  items,
  loading = false,
  onEdit,
  onDelete,
}: SemiProcessedItemListProps) {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    item: SemiProcessedItem | null;
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
        No semi-processed items found. Add your first item to get started.
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Batches</TableHead>
          <TableHead>Last Updated</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item._id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              <Badge variant={item.type === 'batch' ? 'default' : 'secondary'}>
                {item.type === 'batch' ? 'Batch' : 'Fixed'}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {item.currentStock} {item.unit}
            </TableCell>
            <TableCell>
              {!item.batches || item.batches.length === 0 ? (
                <span className="text-muted-foreground">-</span>
              ) : (
                <div className="flex flex-col gap-1">
                  {item.batches.map((batch, idx) => (
                    <div key={batch.batchId || idx} className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {batch.quantity}
                      </Badge>
                      <span className="text-muted-foreground ml-2">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
        ))}
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
        title="Delete Semi-Processed Item"
        description={`Are you sure you want to delete "${deleteDialog.item.name}"? This action cannot be undone.`}
      />
    )}
    </>
  );
}
