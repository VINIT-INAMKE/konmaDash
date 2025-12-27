'use client';

import { useState } from 'react';
import { SemiProcessedItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SemiProcessedItemFormProps {
  initialData?: SemiProcessedItem;
  onSubmit: (data: Partial<SemiProcessedItem>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SemiProcessedItemForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SemiProcessedItemFormProps) {
  const [formData, setFormData] = useState<Partial<SemiProcessedItem>>({
    name: initialData?.name || '',
    type: initialData?.type || 'batch',
    unit: initialData?.unit || 'ml',
    currentStock: initialData?.currentStock || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Butter Chicken, Grated Cheese"
          required
        />
      </div>

      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={formData.type}
          onValueChange={(value) =>
            setFormData({ ...formData, type: value as 'batch' | 'fixed' })
          }
        >
          <SelectTrigger id="type">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="batch">Batch (Cooked/Prepared)</SelectItem>
            <SelectItem value="fixed">Fixed (Pre-made/Frozen)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500 mt-1">
          Batch: Items cooked in kitchen (gravies, etc). Fixed: Pre-made items
          (danish, cheese blocks)
        </p>
      </div>

      <div>
        <Label htmlFor="unit">Unit of Measurement</Label>
        <Select
          value={formData.unit}
          onValueChange={(value) => setFormData({ ...formData, unit: value })}
        >
          <SelectTrigger id="unit">
            <SelectValue placeholder="Select unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ml">ml (milliliters)</SelectItem>
            <SelectItem value="L">L (liters)</SelectItem>
            <SelectItem value="g">g (grams)</SelectItem>
            <SelectItem value="kg">kg (kilograms)</SelectItem>
            <SelectItem value="nos">nos (pieces)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="currentStock">Current Stock</Label>
        <Input
          id="currentStock"
          type="number"
          step="0.01"
          value={formData.currentStock}
          onChange={(e) =>
            setFormData({
              ...formData,
              currentStock: parseFloat(e.target.value) || 0,
            })
          }
          required
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
