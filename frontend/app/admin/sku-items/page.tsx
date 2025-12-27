'use client';

import { useState, useEffect } from 'react';
import { SkuItem } from '@/types';
import { skuItemsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Search, AlertTriangle, ShoppingBag, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SkuItemForm } from '@/components/admin/SkuItemForm';
import { SkuItemList } from '@/components/admin/SkuItemList';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function SkuItemsPage() {
  const [items, setItems] = useState<SkuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkuItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'low-stock'>('all');
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

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = item.isActive;
    if (statusFilter === 'inactive') matchesStatus = !item.isActive;
    if (statusFilter === 'low-stock') matchesStatus = item.currentStallStock <= item.lowStockThreshold;

    return matchesSearch && matchesStatus;
  });

  const activeCount = items.filter(i => i.isActive).length;
  const lowStockCount = items.filter(i => i.currentStallStock <= i.lowStockThreshold).length;
  const totalRevenue = items.reduce((acc, item) => acc + (item.price * item.currentStallStock), 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            SKU Items
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage menu SKU items for sale at the counter
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add SKU Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total SKU Items
            </p>
            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">{items.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Active Items
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold">{activeCount}</p>
            <Badge variant="default" className="text-xs">
              Available
            </Badge>
          </div>
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
                Attention
              </Badge>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Stock Value
            </p>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">₹{totalRevenue.toFixed(0)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search SKU items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <SkuItemList
            items={filteredItems}
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
