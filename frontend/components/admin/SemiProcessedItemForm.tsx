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
    imageUrl: initialData?.imageUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Item Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Butter Chicken, Grated Cheese"
          required
        />
      </div>

      {/* Image URL */}
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Optional: URL to product image for display in sales interface
        </p>
      </div>

      {/* Type and Unit - Grid on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">
            Type <span className="text-destructive">*</span>
          </Label>
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
              <SelectItem value="batch">Batch (Cooked)</SelectItem>
              <SelectItem value="fixed">Fixed (Pre-made)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Unit */}
        <div className="space-y-2">
          <Label htmlFor="unit">
            Unit <span className="text-destructive">*</span>
          </Label>
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
      </div>

      {/* Help Text */}
      <p className="text-sm text-muted-foreground">
        <span className="font-medium">Batch:</span> Items cooked in kitchen (gravies, etc).
        <span className="font-medium ml-2">Fixed:</span> Pre-made items (danish, cheese blocks)
      </p>

      {/* Current Stock */}
      <div className="space-y-2">
        <Label htmlFor="currentStock">
          Current Stock <span className="text-destructive">*</span>
        </Label>
        <Input
          id="currentStock"
          type="number"
          step="0.01"
          min="0"
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

      {/* Buttons */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full sm:w-auto"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto sm:ml-auto"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
