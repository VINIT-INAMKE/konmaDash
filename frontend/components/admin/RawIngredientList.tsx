'use client';

import { RawIngredient } from '@/types';
import { DataTable, Column } from '../DataTable';

interface RawIngredientListProps {
  ingredients: RawIngredient[];
  loading?: boolean;
  onEdit: (ingredient: RawIngredient) => void;
  onDelete: (id: string) => void;
}

export function RawIngredientList({
  ingredients,
  loading,
  onEdit,
  onDelete,
}: RawIngredientListProps) {
  const columns: Column<RawIngredient>[] = [
    {
      header: 'Name',
      accessor: 'name',
      cell: (value) => <span className="font-medium">{value}</span>,
    },
    {
      header: 'Current Stock',
      accessor: (row) => `${row.currentStock} ${row.unit}`,
      cell: (value, row) => {
        const isLow = row.currentStock <= row.reorderLevel;
        return (
          <span className={isLow ? 'text-red-600 font-medium' : ''}>
            {value}
            {isLow && ' ⚠️'}
          </span>
        );
      },
    },
    {
      header: 'Reorder Level',
      accessor: (row) => `${row.reorderLevel} ${row.unit}`,
    },
    {
      header: 'Can Replenish',
      accessor: 'canReplenish',
      cell: (value) => (
        <span
          className={`px-2 py-1 rounded text-xs ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (_, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(row)}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete ${row.name}?`)) {
                onDelete(row._id);
              }
            }}
            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={ingredients}
      columns={columns}
      loading={loading}
      emptyMessage="No raw ingredients found. Add your first ingredient to get started."
    />
  );
}
