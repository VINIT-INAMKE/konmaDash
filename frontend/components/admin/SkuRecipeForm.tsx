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
import { Card, CardContent } from '@/components/ui/card';

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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SKU Item Selection */}
      <div className="space-y-2">
        <Label htmlFor="skuId">
          SKU Item <span className="text-destructive">*</span>
        </Label>
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
          <p className="text-xs text-muted-foreground">
            SKU cannot be changed after creation
          </p>
        )}
      </div>

      {/* Ingredients Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Label className="text-base font-semibold">Recipe Ingredients</Label>
          <Button type="button" size="sm" onClick={addIngredient} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1" />
            Add Ingredient
          </Button>
        </div>

        <div className="space-y-3">
          {ingredients.map((ingredient, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Semi-Processed Item Select - Full width on mobile */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Semi-Processed Item <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={ingredient.semiProcessedId}
                      onValueChange={(value) =>
                        updateIngredient(index, 'semiProcessedId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {ingredient.semiProcessedId && ingredient.semiProcessedName
                            ? `${ingredient.semiProcessedName} (${ingredient.unit})`
                            : 'Select item'}
                        </SelectValue>
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

                  {/* Quantity and Unit in a row */}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Quantity <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={ingredient.quantity}
                        onChange={(e) =>
                          updateIngredient(
                            index,
                            'quantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Unit</Label>
                      <Input
                        value={ingredient.unit}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
          {isLoading ? 'Saving...' : 'Save Recipe'}
        </Button>
      </div>
    </form>
  );
}
