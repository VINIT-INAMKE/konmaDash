'use client';

import { useState } from 'react';
import { SemiProcessedRecipe } from '@/types';
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
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    recipe: SemiProcessedRecipe | null;
  }>({ open: false, recipe: null });
  if (loading) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        No semi-processed recipes found. Add your first recipe to get started.
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Recipe Name</TableHead>
          <TableHead>Output</TableHead>
          <TableHead>Ingredients</TableHead>
          <TableHead>Instructions</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe._id}>
            <TableCell className="font-medium">{recipe.outputName}</TableCell>
            <TableCell>
              {recipe.outputQuantity} {recipe.outputUnit}
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients.map((ing, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ing.ingredientName}: {ing.quantity}
                    {ing.unit}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell className="max-w-md">
              {recipe.instructions ? (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {recipe.instructions}
                </p>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : '-'}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(recipe)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteDialog({ open: true, recipe })}
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

    {deleteDialog.recipe && (
      <DeleteAlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, recipe: null })}
        onConfirm={() => {
          onDelete(deleteDialog.recipe!._id);
          setDeleteDialog({ open: false, recipe: null });
        }}
        title="Delete Recipe"
        description={`Are you sure you want to delete the recipe "${deleteDialog.recipe.outputName}"? This action cannot be undone.`}
      />
    )}
    </>
  );
}
