'use client';

import { useState } from 'react';
import { PurchasedGood } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PurchasedGoodFormProps {
  initialData?: PurchasedGood;
  onSubmit: (data: Partial<PurchasedGood>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PurchasedGoodForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PurchasedGoodFormProps) {
  const [formData, setFormData] = useState<Partial<PurchasedGood>>({
    name: initialData?.name || '',
    category: initialData?.category || 'other',
    unit: initialData?.unit || 'nos',
    currentStock: initialData?.currentStock || 0,
    counterStock: initialData?.counterStock || 0,
    reorderLevel: initialData?.reorderLevel || 0,
    supplier: initialData?.supplier || '',
    requiresPrep: initialData?.requiresPrep || false,
    prepInstructions: initialData?.prepInstructions || '',
    imageUrl: initialData?.imageUrl || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Butter Croissant (Bridor)"
          required
        />
      </div>

      {/* Category and Unit - Grid */}
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
              <SelectItem value="frozen_pastry">Frozen Pastry</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="condiment">Condiment</SelectItem>
              <SelectItem value="topping">Topping</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">
            Unit <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger id="unit">
              <SelectValue />
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
      </div>

      {/* Supplier */}
      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={formData.supplier}
          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          placeholder="e.g., Bridor, Miana, Fortune Foods"
        />
      </div>

      {/* Stock Levels - Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="currentStock">
            Main Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="currentStock"
            type="number"
            min="0"
            value={formData.currentStock}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentStock: parseInt(e.target.value) || 0,
              })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="counterStock">
            Counter Stock <span className="text-destructive">*</span>
          </Label>
          <Input
            id="counterStock"
            type="number"
            min="0"
            value={formData.counterStock}
            onChange={(e) =>
              setFormData({
                ...formData,
                counterStock: parseInt(e.target.value) || 0,
              })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorderLevel">Reorder Level</Label>
          <Input
            id="reorderLevel"
            type="number"
            min="0"
            value={formData.reorderLevel}
            onChange={(e) =>
              setFormData({
                ...formData,
                reorderLevel: parseInt(e.target.value) || 0,
              })
            }
          />
        </div>
      </div>

      {/* Requires Prep */}
      <div className="flex items-start space-x-3 space-y-0">
        <Checkbox
          id="requiresPrep"
          checked={formData.requiresPrep}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, requiresPrep: checked as boolean })
          }
        />
        <div className="space-y-1 leading-none">
          <Label
            htmlFor="requiresPrep"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Requires Preparation
          </Label>
          <p className="text-xs text-muted-foreground">
            Check if this item needs reheating/preparation before use
          </p>
        </div>
      </div>

      {/* Prep Instructions - Show only if requiresPrep */}
      {formData.requiresPrep && (
        <div className="space-y-2">
          <Label htmlFor="prepInstructions">Preparation Instructions</Label>
          <Textarea
            id="prepInstructions"
            value={formData.prepInstructions}
            onChange={(e) =>
              setFormData({ ...formData, prepInstructions: e.target.value })
            }
            placeholder="e.g., Reheat at 180°C for 12 minutes, Thaw before use..."
            rows={3}
          />
        </div>
      )}

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
