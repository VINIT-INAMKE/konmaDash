'use client';

import { useState, useEffect } from 'react';
import { SkuRecipe } from '@/types';
import { skuRecipesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Search, ChefHat } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SkuRecipeForm } from '@/components/admin/SkuRecipeForm';
import { SkuRecipeList } from '@/components/admin/SkuRecipeList';
import { useToast } from '@/hooks/use-toast';

export default function SkuRecipesPage() {
  const [recipes, setRecipes] = useState<SkuRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<SkuRecipe | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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

    // Extract skuId string from potentially populated object
    const skuId = editingRecipe?.skuId
      ? typeof editingRecipe.skuId === 'object'
        ? (editingRecipe.skuId as any)._id
        : editingRecipe.skuId
      : undefined;

    const result = editingRecipe && skuId
      ? await skuRecipesApi.update(String(skuId), data)
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

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.skuName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIngredients = recipes.reduce(
    (acc, recipe) => acc + recipe.ingredients.length,
    0
  );

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            SKU Recipes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Define recipes that convert semi-processed items into final SKU products
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add SKU Recipe
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total Recipes
            </p>
            <ChefHat className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">{recipes.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total Ingredients Used
            </p>
          </div>
          <p className="text-2xl font-bold mt-2">{totalIngredients}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Avg Ingredients/Recipe
            </p>
          </div>
          <p className="text-2xl font-bold mt-2">
            {recipes.length > 0 ? (totalIngredients / recipes.length).toFixed(1) : 0}
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search recipes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <SkuRecipeList
            recipes={filteredRecipes}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
