'use client';

import { useState, useEffect } from 'react';
import { RawIngredient } from '@/types';
import { rawIngredientsApi } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RawIngredientForm } from '@/components/admin/RawIngredientForm';
import { RawIngredientList } from '@/components/admin/RawIngredientList';
import { useToast } from '@/hooks/use-toast';

export default function RawIngredientsPage() {
  const [ingredients, setIngredients] = useState<RawIngredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<RawIngredient | null>(null);
  const [saving, setSaving] = useState(false);
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

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <PageHeader
        title="Raw Ingredients"
        description="Manage raw ingredients inventory that will be used for batch cooking"
        action={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Ingredient
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow">
        <RawIngredientList
          ingredients={ingredients}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
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
