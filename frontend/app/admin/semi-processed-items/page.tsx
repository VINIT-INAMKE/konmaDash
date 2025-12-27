'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedItem } from '@/types';
import { semiProcessedItemsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, Search, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SemiProcessedItemForm } from '@/components/admin/SemiProcessedItemForm';
import { SemiProcessedItemList } from '@/components/admin/SemiProcessedItemList';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function SemiProcessedItemsPage() {
  const [items, setItems] = useState<SemiProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SemiProcessedItem | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'batch' | 'fixed'>('all');
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

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const batchCount = items.filter(i => i.type === 'batch').length;
  const fixedCount = items.filter(i => i.type === 'fixed').length;
  const totalStock = items.reduce((acc, item) => acc + item.currentStock, 0);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Semi-Processed Items
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage batch-cooked gravies and pre-made items
          </p>
        </div>
        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Total Items
            </p>
            <Package className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold mt-2">{items.length}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Batch Items
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold">{batchCount}</p>
            <Badge variant="default" className="text-xs">
              Cooked
            </Badge>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Fixed Items
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold">{fixedCount}</p>
            <Badge variant="secondary" className="text-xs">
              Pre-made
            </Badge>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'batch' | 'fixed')} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="batch">Batch</TabsTrigger>
            <TabsTrigger value="fixed">Fixed</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table Section */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <SemiProcessedItemList
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
