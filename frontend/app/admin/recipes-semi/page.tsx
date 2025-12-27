'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedRecipe } from '@/types';
import { semiProcessedRecipesApi } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SemiProcessedRecipeForm } from '@/components/admin/SemiProcessedRecipeForm';
import { SemiProcessedRecipeList } from '@/components/admin/SemiProcessedRecipeList';
import { useToast } from '@/hooks/use-toast';

export default function SemiProcessedRecipesPage() {
  const [recipes, setRecipes] = useState<SemiProcessedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SemiProcessedRecipe | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    const result = await semiProcessedRecipesApi.getAll();
    if (result.success && result.data) {
      setRecipes(result.data as SemiProcessedRecipe[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load recipes',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingRecipe(null);
    setDialogOpen(true);
  };

  const handleEdit = (recipe: SemiProcessedRecipe) => {
    setEditingRecipe(recipe);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<SemiProcessedRecipe>) => {
    setSaving(true);
    const result = editingRecipe
      ? await semiProcessedRecipesApi.update(editingRecipe._id, data)
      : await semiProcessedRecipesApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: editingRecipe
          ? 'Recipe updated successfully'
          : 'Recipe created successfully',
      });
      setDialogOpen(false);
      loadRecipes();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Operation failed',
        variant: 'destructive',
      });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const result = await semiProcessedRecipesApi.delete(id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Recipe deleted successfully',
      });
      loadRecipes();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete recipe',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <PageHeader
        title="Semi-Processed Recipes"
        description="Define recipes that convert raw ingredients into semi-processed items (batch cooking)"
        action={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Recipe
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow">
        <SemiProcessedRecipeList
          recipes={recipes}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRecipe ? 'Edit' : 'Create'} Semi-Processed Recipe
            </DialogTitle>
          </DialogHeader>
          <SemiProcessedRecipeForm
            initialData={editingRecipe || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
