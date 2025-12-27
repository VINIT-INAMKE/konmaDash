'use client';

import { useState, useEffect } from 'react';
import { SkuRecipe, SkuItem, SemiProcessedItem } from '@/types';
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
import { Plus, Trash2 } from 'lucide-react';
import { skuItemsApi, semiProcessedItemsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SkuRecipeFormProps {
  initialData?: SkuRecipe;
  onSubmit: (data: Partial<SkuRecipe>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface IngredientRow {
  semiProcessedId: string;
  semiProcessedName: string;
  quantity: number;
  unit: string;
}

export function SkuRecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SkuRecipeFormProps) {
  const [skuItems, setSkuItems] = useState<SkuItem[]>([]);
  const [semiProcessedItems, setSemiProcessedItems] = useState<
    SemiProcessedItem[]
  >([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    skuId: initialData?.skuId || '',
    skuName: initialData?.skuName || '',
  });

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData?.ingredients || [
      { semiProcessedId: '', semiProcessedName: '', quantity: 0, unit: '' },
    ]
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [skuResult, semiResult] = await Promise.all([
      skuItemsApi.getAll(),
      semiProcessedItemsApi.getAll(),
    ]);

    if (skuResult.success && skuResult.data) {
      setSkuItems(skuResult.data as SkuItem[]);
    }

    if (semiResult.success && semiResult.data) {
      setSemiProcessedItems(semiResult.data as SemiProcessedItem[]);
    }

    if (!skuResult.success || !semiResult.success) {
      toast({
        title: 'Error',
        description: 'Failed to load required data',
        variant: 'destructive',
      });
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { semiProcessedId: '', semiProcessedName: '', quantity: 0, unit: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    if (field === 'semiProcessedId') {
      const item = semiProcessedItems.find((si) => si._id === value);
      if (item) {
        updated[index] = {
          ...updated[index],
          semiProcessedId: value,
          semiProcessedName: item.name,
          unit: item.unit,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
  };

  const handleSkuChange = (skuId: string) => {
    const sku = skuItems.find((s) => s._id === skuId);
    if (sku) {
      setFormData({
        skuId,
        skuName: sku.name,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.skuId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a SKU item',
        variant: 'destructive',
      });
      return;
    }

    if (
      ingredients.some((ing) => !ing.semiProcessedId || ing.quantity <= 0)
    ) {
      toast({
        title: 'Validation Error',
        description: 'All ingredients must have a selection and quantity > 0',
        variant: 'destructive',
      });
      return;
    }

    await onSubmit({
      ...formData,
      ingredients,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="skuId">SKU Item</Label>
        <Select
          value={formData.skuId}
          onValueChange={handleSkuChange}
          disabled={!!initialData}
        >
          <SelectTrigger id="skuId">
            <SelectValue placeholder="Select SKU item" />
          </SelectTrigger>
          <SelectContent>
            {skuItems.map((sku) => (
              <SelectItem key={sku._id} value={sku._id}>
                {sku.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {initialData && (
          <p className="text-sm text-gray-500 mt-1">
            SKU cannot be changed after creation
          </p>
        )}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <Label>Recipe Ingredients</Label>
          <Button type="button" size="sm" onClick={addIngredient}>
            <Plus className="w-4 h-4 mr-1" />
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg"
            >
              <div className="col-span-5">
                <Label className="text-xs">Semi-Processed Item</Label>
                <Select
                  value={ingredient.semiProcessedId}
                  onValueChange={(value) =>
                    updateIngredient(index, 'semiProcessedId', value)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {semiProcessedItems.map((si) => (
                      <SelectItem key={si._id} value={si._id}>
                        {si.name} ({si.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-3">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={ingredient.quantity}
                  onChange={(e) =>
                    updateIngredient(
                      index,
                      'quantity',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="h-9"
                  required
                />
              </div>

              <div className="col-span-3">
                <Label className="text-xs">Unit</Label>
                <Input
                  value={ingredient.unit}
                  disabled
                  className="h-9 bg-gray-50"
                />
              </div>

              <div className="col-span-1">
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeIngredient(index)}
                  disabled={ingredients.length === 1}
                  className="h-9 w-9 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Recipe'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
