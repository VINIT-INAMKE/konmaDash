'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedRecipe, RawIngredient } from '@/types';
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
import { Plus, Trash2 } from 'lucide-react';
import { rawIngredientsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SemiProcessedRecipeFormProps {
  initialData?: SemiProcessedRecipe;
  onSubmit: (data: Partial<SemiProcessedRecipe>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface IngredientRow {
  rawIngredientId: string;
  rawIngredientName: string;
  quantity: number;
  unit: string;
}

export function SemiProcessedRecipeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: SemiProcessedRecipeFormProps) {
  const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    outputName: initialData?.outputName || '',
    outputQuantity: initialData?.outputQuantity || 0,
    outputUnit: initialData?.outputUnit || 'ml',
    instructions: initialData?.instructions || '',
  });

  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialData?.ingredients || [
      { rawIngredientId: '', rawIngredientName: '', quantity: 0, unit: '' },
    ]
  );

  useEffect(() => {
    loadRawIngredients();
  }, []);

  const loadRawIngredients = async () => {
    const result = await rawIngredientsApi.getAll();
    if (result.success && result.data) {
      setRawIngredients(result.data as RawIngredient[]);
    } else {
      toast({
        title: 'Error',
        description: 'Failed to load raw ingredients',
        variant: 'destructive',
      });
    }
  };

  const addIngredient = () => {
    setIngredients([
      ...ingredients,
      { rawIngredientId: '', rawIngredientName: '', quantity: 0, unit: '' },
    ]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    if (field === 'rawIngredientId') {
      const ingredient = rawIngredients.find((ri) => ri._id === value);
      if (ingredient) {
        updated[index] = {
          ...updated[index],
          rawIngredientId: value,
          rawIngredientName: ingredient.name,
          unit: ingredient.unit,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (ingredients.some((ing) => !ing.rawIngredientId || ing.quantity <= 0)) {
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
        <Label htmlFor="outputName">Output Item Name</Label>
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="outputQuantity">Output Quantity</Label>
          <Input
            id="outputQuantity"
            type="number"
            step="0.01"
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

        <div>
          <Label htmlFor="outputUnit">Output Unit</Label>
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

      <div>
        <Label htmlFor="instructions">Cooking Instructions (Optional)</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) =>
            setFormData({ ...formData, instructions: e.target.value })
          }
          placeholder="Enter cooking instructions..."
          rows={3}
        />
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <Label>Ingredients</Label>
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
                <Label className="text-xs">Raw Ingredient</Label>
                <Select
                  value={ingredient.rawIngredientId}
                  onValueChange={(value) =>
                    updateIngredient(index, 'rawIngredientId', value)
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {rawIngredients.map((ri) => (
                      <SelectItem key={ri._id} value={ri._id}>
                        {ri.name} ({ri.unit})
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
