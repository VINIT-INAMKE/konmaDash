'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedItem } from '@/types';
import { semiProcessedItemsApi } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SemiProcessedItemForm } from '@/components/admin/SemiProcessedItemForm';
import { SemiProcessedItemList } from '@/components/admin/SemiProcessedItemList';
import { useToast } from '@/hooks/use-toast';

export default function SemiProcessedItemsPage() {
  const [items, setItems] = useState<SemiProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SemiProcessedItem | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const result = await semiProcessedItemsApi.getAll();
    if (result.success && result.data) {
      setItems(result.data as SemiProcessedItem[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load semi-processed items',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: SemiProcessedItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<SemiProcessedItem>) => {
    setSaving(true);
    const result = editingItem
      ? await semiProcessedItemsApi.update(editingItem._id, data)
      : await semiProcessedItemsApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: editingItem
          ? 'Semi-processed item updated successfully'
          : 'Semi-processed item created successfully',
      });
      setDialogOpen(false);
      loadItems();
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
    const result = await semiProcessedItemsApi.delete(id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Semi-processed item deleted successfully',
      });
      loadItems();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete item',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <PageHeader
        title="Semi-Processed Items"
        description="Manage semi-processed inventory (batch-cooked gravies and fixed items like danish, cheese)"
        action={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow">
        <SemiProcessedItemList
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Edit' : 'Add'} Semi-Processed Item
            </DialogTitle>
          </DialogHeader>
          <SemiProcessedItemForm
            initialData={editingItem || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={saving}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
