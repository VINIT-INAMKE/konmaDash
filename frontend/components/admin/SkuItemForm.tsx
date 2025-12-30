'use client';

import { useState } from 'react';
import { SkuItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    imageUrl: initialData?.imageUrl || '',
    category: initialData?.category || 'other',
    requiresAssembly: initialData?.requiresAssembly !== false,
    assemblyLocation: initialData?.assemblyLocation || 'kitchen',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SKU Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          SKU Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Butter Chicken Danish"
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

      {/* Category and Assembly Location - Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value as any })
            }
          >
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bakery">Bakery</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="assemblyLocation">
            Assembly Location <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.assemblyLocation}
            onValueChange={(value) =>
              setFormData({ ...formData, assemblyLocation: value as any })
            }
          >
            <SelectTrigger id="assemblyLocation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kitchen">Kitchen (Prep)</SelectItem>
              <SelectItem value="counter">Counter (Assembly)</SelectItem>
              <SelectItem value="none">None (Pre-Made)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Requires Assembly */}
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="requiresAssembly"
          checked={formData.requiresAssembly}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, requiresAssembly: checked as boolean })
          }
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="requiresAssembly"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Requires Assembly
          </Label>
          <p className="text-xs text-muted-foreground">
            Check if this item needs to be assembled from ingredients
          </p>
        </div>
      </div>

      {/* Target SKUs and Current Stock - Grid on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="targetSkus">
            Target SKUs <span className="text-destructive">*</span>
          </Label>
          <Input
            id="targetSkus"
            type="number"
            min="0"
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
          <p className="text-xs text-muted-foreground">
            Total planned for event
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentStallStock">
            Counter Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="currentStallStock"
            type="number"
            min="0"
            value={formData.currentStallStock}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentStallStock: parseInt(e.target.value) || 0,
              })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            Units at counter/stall
          </p>
        </div>
      </div>

      {/* Low Stock Threshold and Price - Grid on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lowStockThreshold">
            Low Stock Alert <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min="0"
            value={formData.lowStockThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                lowStockThreshold: parseInt(e.target.value) || 0,
              })
            }
            required
          />
          <p className="text-xs text-muted-foreground">
            Alert at or below this number
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">
            Price (₹) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
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
          <p className="text-xs text-muted-foreground">
            Selling price per unit
          </p>
        </div>
      </div>

      {/* Is Active */}
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isActive: checked as boolean })
          }
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="isActive"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Active (available for sale)
          </Label>
          <p className="text-xs text-muted-foreground">
            Mark as active to make this item available for sale
          </p>
        </div>
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
