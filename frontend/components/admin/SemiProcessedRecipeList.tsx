'use client';

import { SemiProcessedRecipe } from '@/types';
import { DataTable, Column } from '../DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface SemiProcessedRecipeListProps {
  recipes: SemiProcessedRecipe[];
  loading?: boolean;
  onEdit: (recipe: SemiProcessedRecipe) => void;
  onDelete: (id: string) => void;
}

export function SemiProcessedRecipeList({
  recipes,
  loading = false,
  onEdit,
  onDelete,
}: SemiProcessedRecipeListProps) {
  const columns: Column<SemiProcessedRecipe>[] = [
    {
      header: 'Recipe Name',
      accessor: 'outputName',
      cell: (value) => <span className="font-medium">{value}</span>,
    },
    {
      header: 'Output',
      accessor: 'outputQuantity',
      cell: (_, row) => (
        <span>
          {row.outputQuantity} {row.outputUnit}
        </span>
      ),
    },
    {
      header: 'Ingredients',
      accessor: 'ingredients',
      cell: (ingredients) => (
        <div className="flex flex-wrap gap-1">
          {ingredients.map((ing: any, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {ing.rawIngredientName}: {ing.quantity}
              {ing.unit}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      header: 'Instructions',
      accessor: 'instructions',
      cell: (value) =>
        value ? (
          <span className="text-sm text-gray-600 line-clamp-2">{value}</span>
        ) : (
          <span className="text-gray-400">-</span>
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
                  `Are you sure you want to delete recipe "${row.outputName}"? This action cannot be undone.`
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
