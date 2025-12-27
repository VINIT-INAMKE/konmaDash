'use client';

import { SkuRecipe } from '@/types';
import { DataTable, Column } from '../DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface SkuRecipeListProps {
  recipes: SkuRecipe[];
  loading?: boolean;
  onEdit: (recipe: SkuRecipe) => void;
  onDelete: (id: string) => void;
}

export function SkuRecipeList({
  recipes,
  loading = false,
  onEdit,
  onDelete,
}: SkuRecipeListProps) {
  const columns: Column<SkuRecipe>[] = [
    {
      header: 'SKU Name',
      accessor: 'skuName',
      cell: (value) => <span className="font-medium">{value}</span>,
    },
    {
      header: 'Recipe Ingredients',
      accessor: 'ingredients',
      cell: (ingredients) => (
        <div className="flex flex-wrap gap-1">
          {ingredients.map((ing: any, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {ing.semiProcessedName}: {ing.quantity}
              {ing.unit}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Created',
      accessor: 'createdAt',
      cell: (value) =>
        value ? new Date(value).toLocaleDateString() : <span>-</span>,
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
                  `Are you sure you want to delete recipe for "${row.skuName}"? This action cannot be undone.`
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

  return <DataTable data={recipes} columns={columns} loading={loading} />;
}
