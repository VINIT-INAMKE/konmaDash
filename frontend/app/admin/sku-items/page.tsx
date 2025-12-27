'use client';

import { useState, useEffect } from 'react';
import { SkuItem } from '@/types';
import { skuItemsApi } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SkuItemForm } from '@/components/admin/SkuItemForm';
import { SkuItemList } from '@/components/admin/SkuItemList';
import { useToast } from '@/hooks/use-toast';

export default function SkuItemsPage() {
  const [items, setItems] = useState<SkuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const result = await skuItemsApi.getAll();
    if (result.success && result.data) {
      setItems(result.data as SkuItem[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load SKU items',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: SkuItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<SkuItem>) => {
    setSaving(true);
    const result = editingItem
      ? await skuItemsApi.update(editingItem._id, data)
      : await skuItemsApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: editingItem
          ? 'SKU item updated successfully'
          : 'SKU item created successfully',
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
    const result = await skuItemsApi.delete(id);
    if (result.success) {
      toast({
        title: 'Success',
        description: 'SKU item deleted successfully',
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
        title="SKU Items"
        description="Manage menu SKU items that will be sold at the counter"
        action={
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add SKU Item
          </Button>
        }
      />

      <div className="bg-white rounded-lg shadow">
        <SkuItemList
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit' : 'Add'} SKU Item</DialogTitle>
          </DialogHeader>
          <SkuItemForm
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
