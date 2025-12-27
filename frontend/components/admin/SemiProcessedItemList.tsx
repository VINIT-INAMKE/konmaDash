'use client';

import { SemiProcessedItem } from '@/types';
import { DataTable, Column } from '../DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

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
  const columns: Column<SemiProcessedItem>[] = [
    {
      header: 'Name',
      accessor: 'name',
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
      cell: (_, row) => (
        <span className="font-medium">
          {row.currentStock} {row.unit}
        </span>
      ),
    },
    {
      header: 'Batches',
      accessor: 'batches',
      cell: (batches: Array<{ batchId: string; quantity: number; createdAt: string }> | undefined) => {
        if (!batches || batches.length === 0) {
          return <span className="text-gray-400">-</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {batches.map((batch, idx) => (
              <div key={batch.batchId || idx} className="text-sm">
                <Badge variant="outline" className="text-xs">
                  {batch.quantity}
                </Badge>
                <span className="text-gray-500 ml-2">
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
      cell: (value) => new Date(value).toLocaleString(),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (_, row) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(row)}
            className="h-8"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              if (
                confirm(
                  `Are you sure you want to delete "${row.name}"? This action cannot be undone.`
                )
              ) {
                onDelete(row._id);
              }
            }}
            className="h-8"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return <DataTable data={items} columns={columns} loading={loading} />;
}
