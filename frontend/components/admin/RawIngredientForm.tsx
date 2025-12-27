'use client';

import { useState } from 'react';
import { RawIngredient } from '@/types';
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
import { Checkbox } from '@/components/ui/checkbox';

interface RawIngredientFormProps {
  initialData?: Partial<RawIngredient>;
  onSubmit: (data: Partial<RawIngredient>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RawIngredientForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: RawIngredientFormProps) {
  const [formData, setFormData] = useState<Partial<RawIngredient>>({
    name: initialData?.name || '',
    unit: initialData?.unit || 'kg',
    currentStock: initialData?.currentStock || 0,
    reorderLevel: initialData?.reorderLevel || 0,
    canReplenish: initialData?.canReplenish !== false,
    imageUrl: initialData?.imageUrl || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Chicken"
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

      {/* Unit and Stock - Grid on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="nos">nos</SelectItem>
              <SelectItem value="pieces">pieces</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Current Stock */}
        <div className="space-y-2">
          <Label htmlFor="currentStock">
            Current Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="currentStock"
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.currentStock}
            onChange={(e) =>
              setFormData({ ...formData, currentStock: parseFloat(e.target.value) || 0 })
            }
          />
        </div>
      </div>

      {/* Reorder Level */}
      <div className="space-y-2">
        <Label htmlFor="reorderLevel">
          Reorder Level <span className="text-destructive">*</span>
        </Label>
        <Input
          id="reorderLevel"
          type="number"
          required
          min="0"
          step="0.01"
          value={formData.reorderLevel}
          onChange={(e) =>
            setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) || 0 })
          }
        />
        <p className="text-xs text-muted-foreground">
          Alert when stock falls below this level
        </p>
      </div>

      {/* Can Replenish */}
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="canReplenish"
          checked={formData.canReplenish}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, canReplenish: checked === true })
          }
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="canReplenish"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Can Replenish
          </Label>
          <p className="text-xs text-muted-foreground">
            Uncheck for fixed/limited items like frozen pastries
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
