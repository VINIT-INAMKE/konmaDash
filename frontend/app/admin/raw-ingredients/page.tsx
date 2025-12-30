'use client';

import { useState, useEffect } from 'react';
import { RawIngredient } from '@/types';
import { rawIngredientsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertTriangle, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { RawIngredientForm } from '@/components/admin/RawIngredientForm';
import { RawIngredientList } from '@/components/admin/RawIngredientList';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function RawIngredientsPage() {
  const [ingredients, setIngredients] = useState<RawIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<RawIngredient | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    setLoading(true);
    const result = await rawIngredientsApi.getAll();
    if (result.success && result.data) {
      setIngredients(result.data as RawIngredient[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load ingredients',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingIngredient(null);
    setDialogOpen(true);
  };

  const handleEdit = (ingredient: RawIngredient) => {
    setEditingIngredient(ingredient);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<RawIngredient>) => {
    setSaving(true);
    const result = editingIngredient
      ? await rawIngredientsApi.update(editingIngredient._id, data)
      : await rawIngredientsApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: editingIngredient
          ? 'Ingredient updated successfully'
          : 'Ingredient created successfully',
      });
      setDialogOpen(false);
      loadIngredients();
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
    const result = await rawIngredientsApi.delete(id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Ingredient deleted successfully',
      });
      loadIngredients();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete ingredient',
        variant: 'destructive',
      });
    }
  };

  const filteredIngredients = ingredients.filter((ingredient) => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' ||
      (ingredient.category && ingredient.category.toLowerCase() === categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = ingredients.filter(
    (ing) => ing.currentStock <= ing.reorderLevel
  ).length;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Raw Ingredients
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage raw ingredients inventory for batch cooking
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total Ingredients
            </p>
          </div>
          <p className="text-2xl font-bold mt-2">{ingredients.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Low Stock Alerts
            </p>
            {lowStockCount > 0 && (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-destructive' : ''}`}>
              {lowStockCount}
            </p>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                Needs attention
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories ({ingredients.length})</SelectItem>
              <SelectItem value="uncategorized">Uncategorized</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="protein">Protein</SelectItem>
              <SelectItem value="vegetable">Vegetable</SelectItem>
              <SelectItem value="chocolate">Chocolate</SelectItem>
              <SelectItem value="spice">Spice</SelectItem>
              <SelectItem value="oil">Oil</SelectItem>
              <SelectItem value="seasoning">Seasoning</SelectItem>
              <SelectItem value="sweetener">Sweetener</SelectItem>
              <SelectItem value="flavoring">Flavoring</SelectItem>
              <SelectItem value="paste">Paste</SelectItem>
              <SelectItem value="condiment">Condiment</SelectItem>
              <SelectItem value="flour">Flour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <RawIngredientList
            ingredients={filteredIngredients}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? 'Edit' : 'Add'} Raw Ingredient
            </DialogTitle>
          </DialogHeader>
          <RawIngredientForm
            initialData={editingIngredient || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
