'use client';

import { useState, useEffect } from 'react';
import { SkuRecipe, SkuItem, IngredientReference } from '@/types';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { skuItemsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { PolymorphicIngredientSelector } from './PolymorphicIngredientSelector';

interface SkuRecipeFormProps {
  initialData?: SkuRecipe;
  onSubmit: (data: Partial<SkuRecipe>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SkuRecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SkuRecipeFormProps) {
  const [skuItems, setSkuItems] = useState<SkuItem[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Handle populated skuId (object) vs string ID
    skuId: typeof initialData?.skuId === 'object'
      ? String((initialData.skuId as any)._id || '')
      : String(initialData?.skuId || ''),
    skuName: initialData?.skuName || '',
    hasRecipe: initialData?.hasRecipe !== false, // Default true
    assemblyInstructions: initialData?.assemblyInstructions || '',
  });

  const [ingredients, setIngredients] = useState<IngredientReference[]>(
    initialData?.ingredients?.map((ing) => ({
      ...ing,
      // Normalize ingredientId - extract _id if it's a populated object
      ingredientId: typeof ing.ingredientId === 'object'
        ? String((ing.ingredientId as any)._id || '')
        : String(ing.ingredientId || ''),
    })) || [
      {
        ingredientType: 'semiProcessed',
        ingredientId: '',
        ingredientRef: 'SemiProcessedItem',
        ingredientName: '',
        quantity: 0,
        unit: '',
      },
    ]
  );

  useEffect(() => {
    loadSkuItems();
  }, []);

  const loadSkuItems = async () => {
    const result = await skuItemsApi.getAll();
    if (result.success && result.data) {
      // Ensure all SKU item IDs are strings
      const normalizedItems = (result.data as SkuItem[]).map(item => ({
        ...item,
        _id: String(item._id)
      }));
      setSkuItems(normalizedItems);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load SKU items',
        variant: 'destructive',
      });
    }
  };

  const handleSkuChange = (skuId: string) => {
    const sku = skuItems.find((s) => s._id === skuId);
    if (sku) {
      setFormData({
        ...formData,
        skuId: String(skuId), // Ensure it's always a string
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

    // Check if skuId is malformed
    if (String(formData.skuId).includes('[object')) {
      toast({
        title: 'System Error',
        description: 'Invalid SKU ID format. Please refresh and try again.',
        variant: 'destructive',
      });
      console.error('Malformed skuId:', formData.skuId);
      return;
    }

    if (formData.hasRecipe && ingredients.some((ing) => !ing.ingredientId || ing.quantity <= 0)) {
      toast({
        title: 'Validation Error',
        description: 'All ingredients must have a selection and quantity > 0',
        variant: 'destructive',
      });
      return;
    }

    // Prepare submission data
    const submitData: any = {
      skuName: formData.skuName,
      hasRecipe: formData.hasRecipe,
      assemblyInstructions: formData.assemblyInstructions,
      ingredients: formData.hasRecipe ? ingredients : [],
    };

    // Only include skuId for new recipes (not updates)
    if (!initialData) {
      // Ensure skuId is a string, not an object
      submitData.skuId = typeof formData.skuId === 'object'
        ? (formData.skuId as any)._id
        : formData.skuId;
    }

    await onSubmit(submitData);
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

      {/* Has Recipe Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="hasRecipe"
          checked={formData.hasRecipe}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, hasRecipe: checked as boolean })
          }
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="hasRecipe"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Has Recipe
          </Label>
          <p className="text-xs text-muted-foreground">
            Uncheck for simple purchased items that don't require assembly (e.g., plain croissants)
          </p>
        </div>
      </div>

      {/* Assembly Instructions */}
      {formData.hasRecipe && (
        <div className="space-y-2">
          <Label htmlFor="assemblyInstructions">
            Assembly Instructions (Optional)
          </Label>
          <Textarea
            id="assemblyInstructions"
            value={formData.assemblyInstructions}
            onChange={(e) =>
              setFormData({ ...formData, assemblyInstructions: e.target.value })
            }
            placeholder="e.g., Bake croissant, cool 2 min, drizzle 20g chocolate..."
            rows={6}
            className="resize-y whitespace-pre-wrap"
          />
        </div>
      )}

      {/* Ingredients - Show only if hasRecipe is true */}
      {formData.hasRecipe && (
        <PolymorphicIngredientSelector
          ingredients={ingredients}
          onChange={setIngredients}
          allowedTypes={['raw', 'semiProcessed', 'purchasedGood']}
          label="Recipe Ingredients"
        />
      )}

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
