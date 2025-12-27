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
import { Card, CardContent } from '@/components/ui/card';

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
          rows={3}
        />
      </div>

      {/* Ingredients Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <Label className="text-base font-semibold">Ingredients</Label>
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
                  {/* Ingredient Select - Full width on mobile */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Raw Ingredient <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={ingredient.rawIngredientId}
                      onValueChange={(value) =>
                        updateIngredient(index, 'rawIngredientId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue>
                          {ingredient.rawIngredientId && ingredient.rawIngredientName
                            ? `${ingredient.rawIngredientName} (${ingredient.unit})`
                            : 'Select ingredient'}
                        </SelectValue>
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
