'use client';

import { SkuRecipe } from '@/types';
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
        No SKU recipes found. Add your first recipe to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU Name</TableHead>
          <TableHead>Recipe Ingredients</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {recipes.map((recipe) => (
          <TableRow key={recipe._id}>
            <TableCell className="font-medium">{recipe.skuName}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {recipe.ingredients.map((ing, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {ing.semiProcessedName}: {ing.quantity}
                    {ing.unit}
                  </Badge>
                ))}
              </div>
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
                  onClick={() => {
                    if (
                      confirm(
                        `Are you sure you want to delete recipe for "${recipe.skuName}"? This action cannot be undone.`
                      )
                    ) {
                      onDelete(recipe._id);
                    }
                  }}
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
  );
}
