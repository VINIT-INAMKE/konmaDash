'use client';

import { useState, useEffect } from 'react';
import { SkuRecipe } from '@/types';
import { skuRecipesApi } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SkuRecipeForm } from '@/components/admin/SkuRecipeForm';
import { SkuRecipeList } from '@/components/admin/SkuRecipeList';
import { useToast } from '@/hooks/use-toast';

export default function SkuRecipesPage() {
  const [recipes, setRecipes] = useState<SkuRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SkuRecipe | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    setLoading(true);
    const result = await skuRecipesApi.getAll();
    if (result.success && result.data) {
      setRecipes(result.data as SkuRecipe[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load SKU recipes',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingRecipe(null);
    setDialogOpen(true);
  };

  const handleEdit = (recipe: SkuRecipe) => {
    setEditingRecipe(recipe);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<SkuRecipe>) => {
    setSaving(true);
    const result = editingRecipe
      ? await skuRecipesApi.update(editingRecipe._id, data)
      : await skuRecipesApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: editingRecipe
          ? 'SKU recipe updated successfully'
          : 'SKU recipe created successfully',
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
    const result = await skuRecipesApi.delete(id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'SKU recipe deleted successfully',
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
        title="SKU Recipes"
        description="Define recipes that convert semi-processed items into final SKU products"
        action={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add SKU Recipe
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow">
        <SkuRecipeList
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
              {editingRecipe ? 'Edit' : 'Create'} SKU Recipe
            </DialogTitle>
          </DialogHeader>
          <SkuRecipeForm
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
