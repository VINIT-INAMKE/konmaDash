'use client';

import { SkuItem } from '@/types';
import { DataTable, Column } from '../DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, AlertTriangle } from 'lucide-react';

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
  const columns: Column<SkuItem>[] = [
    {
      header: 'SKU Name',
      accessor: 'name',
    },
    {
      header: 'Counter Stock',
      accessor: 'currentStallStock',
      cell: (_, row) => {
        const isLowStock = row.currentStallStock <= row.lowStockThreshold;
        return (
          <div className="flex items-center gap-2">
            {isLowStock && (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <span
              className={`font-medium ${isLowStock ? 'text-red-600' : ''}`}
            >
              {row.currentStallStock}
            </span>
          </div>
        );
      },
    },
    {
      header: 'Target',
      accessor: 'targetSkus',
      cell: (value) => <span className="text-gray-600">{value}</span>,
    },
    {
      header: 'Low Stock Alert',
      accessor: 'lowStockThreshold',
      cell: (value) => (
        <Badge variant="outline" className="text-xs">
          ≤ {value}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'isActive',
      cell: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
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
