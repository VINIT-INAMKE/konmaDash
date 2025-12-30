'use client';

import { useState, useEffect } from 'react';
import { PurchasedGood } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useToast } from '@/hooks/use-toast';
import { purchasedGoodsApi } from '@/lib/api';
import { PurchasedGoodForm } from '@/components/admin/PurchasedGoodForm';
import { PurchasedGoodList } from '@/components/admin/PurchasedGoodList';
import { PageHeader } from '@/components/PageHeader';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function PurchasedGoodsPage() {
  const [goods, setGoods] = useState<PurchasedGood[]>([]);
  const [filteredGoods, setFilteredGoods] = useState<PurchasedGood[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGood, setEditingGood] = useState<PurchasedGood | undefined>();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadGoods();
  }, []);

  useEffect(() => {
    // Filter goods when category filter changes
    if (categoryFilter === 'all') {
      setFilteredGoods(goods);
    } else {
      setFilteredGoods(goods.filter((g) => g.category === categoryFilter));
    }
  }, [categoryFilter, goods]);

  const loadGoods = async () => {
    setIsLoading(true);
    const result = await purchasedGoodsApi.getAll();

    if (result.success && result.data) {
      setGoods(result.data as PurchasedGood[]);
      setFilteredGoods(result.data as PurchasedGood[]);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to load purchased goods',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const handleCreate = () => {
    setEditingGood(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (good: PurchasedGood) => {
    setEditingGood(good);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (data: Partial<PurchasedGood>) => {
    setIsSubmitting(true);

    const result = editingGood
      ? await purchasedGoodsApi.update(editingGood._id, data)
      : await purchasedGoodsApi.create(data);

    if (result.success) {
      toast({
        title: 'Success',
        description: `Purchased good ${
          editingGood ? 'updated' : 'created'
        } successfully`,
      });
      setIsDialogOpen(false);
      loadGoods();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to save purchased good',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this purchased good?'))
      return;

    const result = await purchasedGoodsApi.delete(id);

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Purchased good deleted successfully',
      });
      loadGoods();
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to delete purchased good',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchased Goods"
        description="Manage frozen pastries, dairy, condiments, and other purchased items"
      />

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="frozen_pastry">Frozen Pastry</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="condiment">Condiment</SelectItem>
              <SelectItem value="topping">Topping</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Purchased Good
        </Button>
      </div>

      {/* List */}
      <PurchasedGoodList
        goods={filteredGoods}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingGood ? 'Edit Purchased Good' : 'Add Purchased Good'}
            </DialogTitle>
            <DialogDescription>
              {editingGood
                ? 'Update the purchased good details below.'
                : 'Add a new purchased good (frozen pastries, dairy, etc).'}
            </DialogDescription>
          </DialogHeader>
          <PurchasedGoodForm
            initialData={editingGood}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isLoading={isSubmitting}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
