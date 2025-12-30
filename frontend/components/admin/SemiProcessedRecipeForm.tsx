'use client';

import { useState } from 'react';
import { SemiProcessedRecipe, IngredientReference } from '@/types';
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
import { useToast } from '@/hooks/use-toast';
import { PolymorphicIngredientSelector } from './PolymorphicIngredientSelector';

interface SemiProcessedRecipeFormProps {
  initialData?: SemiProcessedRecipe;
  onSubmit: (data: Partial<SemiProcessedRecipe>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function SemiProcessedRecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SemiProcessedRecipeFormProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    outputName: initialData?.outputName || '',
    outputQuantity: initialData?.outputQuantity || 0,
    outputUnit: initialData?.outputUnit || 'ml',
    instructions: initialData?.instructions || '',
    holdingTimeHours: initialData?.holdingTimeHours || 24,
    storageTemp: initialData?.storageTemp || 'chiller_2_4',
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
        ingredientType: 'raw',
        ingredientId: '',
        ingredientRef: 'RawIngredient',
        ingredientName: '',
        quantity: 0,
        unit: '',
      },
    ]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (ingredients.some((ing) => !ing.ingredientId || ing.quantity <= 0)) {
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
      {/* Output Name */}
      <div className="space-y-2">
        <Label htmlFor="outputName">
          Output Item Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="outputName"
          value={formData.outputName}
          onChange={(e) =>
            setFormData({ ...formData, outputName: e.target.value })
          }
          placeholder="e.g., Butter Chicken"
          required
        />
      </div>

      {/* Output Quantity and Unit - Grid on larger screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="outputQuantity">
            Output Quantity <span className="text-destructive">*</span>
          </Label>
          <Input
            id="outputQuantity"
            type="number"
            step="0.01"
            min="0"
            value={formData.outputQuantity}
            onChange={(e) =>
              setFormData({
                ...formData,
                outputQuantity: parseFloat(e.target.value) || 0,
              })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="outputUnit">
            Output Unit <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.outputUnit}
            onValueChange={(value) =>
              setFormData({ ...formData, outputUnit: value })
            }
          >
            <SelectTrigger id="outputUnit">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ml">ml</SelectItem>
              <SelectItem value="L">L</SelectItem>
              <SelectItem value="g">g</SelectItem>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="nos">nos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <Label htmlFor="instructions">Cooking Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) =>
            setFormData({ ...formData, instructions: e.target.value })
          }
          placeholder="Enter cooking instructions..."
          rows={6}
          className="resize-y whitespace-pre-wrap"
        />
      </div>

      {/* Holding Time and Storage - Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="holdingTimeHours">
            Shelf Life (Hours) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="holdingTimeHours"
            type="number"
            min="1"
            value={formData.holdingTimeHours}
            onChange={(e) =>
              setFormData({
                ...formData,
                holdingTimeHours: parseInt(e.target.value) || 24,
              })
            }
            placeholder="e.g., 24, 48, 168"
            required
          />
          <p className="text-xs text-muted-foreground">
            24h for most items, 48h for gravies, 168h (7 days) for frozen items
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storageTemp">
            Storage Temperature <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.storageTemp}
            onValueChange={(value) =>
              setFormData({ ...formData, storageTemp: value as 'chiller_2_4' | 'freezer_minus_18' | 'warm_30_32' | 'room_temp' })
            }
          >
            <SelectTrigger id="storageTemp">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="chiller_2_4">Chiller (2-4°C)</SelectItem>
              <SelectItem value="freezer_minus_18">Freezer (-18°C)</SelectItem>
              <SelectItem value="warm_30_32">Warm (30-32°C)</SelectItem>
              <SelectItem value="room_temp">Room Temperature</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ingredients - Polymorphic Selector */}
      <PolymorphicIngredientSelector
        ingredients={ingredients}
        onChange={setIngredients}
        allowedTypes={['raw', 'semiProcessed', 'purchasedGood']}
        label="Ingredients"
      />

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
