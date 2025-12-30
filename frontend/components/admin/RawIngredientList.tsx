'use client';

import { useState } from 'react';
import { RawIngredient } from '@/types';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteAlertDialog } from './DeleteAlertDialog';

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
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ingredient: RawIngredient | null;
  }>({ open: false, ingredient: null });
  if (loading) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (ingredients.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        No raw ingredients found. Add your first ingredient to get started.
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Current Stock</TableHead>
          <TableHead>Reorder Level</TableHead>
          <TableHead>Can Replenish</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ingredients.map((ingredient) => {
          const isLow = ingredient.currentStock <= ingredient.reorderLevel;
          return (
            <TableRow key={ingredient._id}>
              <TableCell className="font-medium">{ingredient.name}</TableCell>
              <TableCell>
                <span className={isLow ? 'text-destructive font-medium' : ''}>
                  {ingredient.currentStock} {ingredient.unit}
                  {isLow && ' ⚠️'}
                </span>
              </TableCell>
              <TableCell>
                {ingredient.reorderLevel} {ingredient.unit}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ingredient.canReplenish
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {ingredient.canReplenish ? 'Yes' : 'No'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => onEdit(ingredient)}
                    variant="outline"
                    size="sm"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeleteDialog({ open: true, ingredient })}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>

    {deleteDialog.ingredient && (
      <DeleteAlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, ingredient: null })}
        onConfirm={() => {
          onDelete(deleteDialog.ingredient!._id);
          setDeleteDialog({ open: false, ingredient: null });
        }}
        title="Delete Raw Ingredient"
        description={`Are you sure you want to delete "${deleteDialog.ingredient.name}"? This action cannot be undone.`}
      />
    )}
    </>
  );
}
