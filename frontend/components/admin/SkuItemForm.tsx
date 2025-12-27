'use client';

import { useState } from 'react';
import { SkuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SkuItemFormProps {
  initialData?: SkuItem;
  onSubmit: (data: Partial<SkuItem>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SkuItemForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SkuItemFormProps) {
  const [formData, setFormData] = useState<Partial<SkuItem>>({
    name: initialData?.name || '',
    targetSkus: initialData?.targetSkus || 0,
    currentStallStock: initialData?.currentStallStock || 0,
    lowStockThreshold: initialData?.lowStockThreshold || 5,
    price: initialData?.price || 0,
    isActive: initialData?.isActive !== undefined ? initialData.isActive : true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">SKU Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Butter Chicken Danish"
          required
        />
      </div>

      <div>
        <Label htmlFor="targetSkus">Target SKUs for Event</Label>
        <Input
          id="targetSkus"
          type="number"
          value={formData.targetSkus}
          onChange={(e) =>
            setFormData({
              ...formData,
              targetSkus: parseInt(e.target.value) || 0,
            })
          }
          placeholder="e.g., 15"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Total number of this SKU planned for the event
        </p>
      </div>

      <div>
        <Label htmlFor="currentStallStock">Current Counter Stock</Label>
        <Input
          id="currentStallStock"
          type="number"
          value={formData.currentStallStock}
          onChange={(e) =>
            setFormData({
              ...formData,
              currentStallStock: parseInt(e.target.value) || 0,
            })
          }
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          How many units are currently at the counter/stall
        </p>
      </div>

      <div>
        <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold</Label>
        <Input
          id="lowStockThreshold"
          type="number"
          value={formData.lowStockThreshold}
          onChange={(e) =>
            setFormData({
              ...formData,
              lowStockThreshold: parseInt(e.target.value) || 0,
            })
          }
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Alert when counter stock drops to or below this number
        </p>
      </div>

      <div>
        <Label htmlFor="price">Price (₹)</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) =>
            setFormData({
              ...formData,
              price: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="e.g., 150"
          required
        />
        <p className="text-sm text-gray-500 mt-1">
          Selling price per unit in rupees
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isActive: checked as boolean })
          }
        />
        <Label htmlFor="isActive" className="cursor-pointer">
          Active (available for sale)
        </Label>
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
