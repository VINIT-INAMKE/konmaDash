'use client';

import { useState, useEffect } from 'react';
import { IngredientReference, RawIngredient, SemiProcessedItem, PurchasedGood } from '@/types';
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
import { rawIngredientsApi, semiProcessedItemsApi, purchasedGoodsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface PolymorphicIngredientSelectorProps {
  ingredients: IngredientReference[];
  onChange: (ingredients: IngredientReference[]) => void;
  allowedTypes?: ('raw' | 'semiProcessed' | 'purchasedGood')[];
  label?: string;
}

export function PolymorphicIngredientSelector({
  ingredients,
  onChange,
  allowedTypes = ['raw', 'semiProcessed', 'purchasedGood'],
  label = 'Ingredients',
}: PolymorphicIngredientSelectorProps) {
  const [rawIngredients, setRawIngredients] = useState<RawIngredient[]>([]);
  const [semiProcessedItems, setSemiProcessedItems] = useState<SemiProcessedItem[]>([]);
  const [purchasedGoods, setPurchasedGoods] = useState<PurchasedGood[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadIngredients();
  }, []);

  const loadIngredients = async () => {
    try {
      // Load all inventory types in parallel
      const [rawResult, semiResult, purchasedResult] = await Promise.all([
        allowedTypes.includes('raw') ? rawIngredientsApi.getAll() : Promise.resolve({ success: true, data: [] }),
        allowedTypes.includes('semiProcessed') ? semiProcessedItemsApi.getAll() : Promise.resolve({ success: true, data: [] }),
        allowedTypes.includes('purchasedGood') ? purchasedGoodsApi.getAll() : Promise.resolve({ success: true, data: [] }),
      ]);

      if (rawResult.success && rawResult.data) {
        setRawIngredients(rawResult.data as RawIngredient[]);
      }

      if (semiResult.success && semiResult.data) {
        setSemiProcessedItems(semiResult.data as SemiProcessedItem[]);
      }

      if (purchasedResult.success && purchasedResult.data) {
        setPurchasedGoods(purchasedResult.data as PurchasedGood[]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load ingredients',
        variant: 'destructive',
      });
    }
  };

  const addIngredient = () => {
    onChange([
      ...ingredients,
      {
        ingredientType: allowedTypes[0],
        ingredientId: '',
        ingredientRef: allowedTypes[0] === 'raw' ? 'RawIngredient' : allowedTypes[0] === 'semiProcessed' ? 'SemiProcessedItem' : 'PurchasedGood',
        ingredientName: '',
        quantity: 0,
        unit: '',
      },
    ]);
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];

    if (field === 'ingredientType') {
      // Reset ingredient when type changes
      updated[index] = {
        ingredientType: value,
        ingredientId: '',
        ingredientRef: value === 'raw' ? 'RawIngredient' : value === 'semiProcessed' ? 'SemiProcessedItem' : 'PurchasedGood',
        ingredientName: '',
        quantity: updated[index].quantity || 0,
        unit: '',
      };
    } else if (field === 'ingredientId') {
      // Auto-populate name and unit when ingredient is selected
      const type = updated[index].ingredientType;
      let item: any = null;

      if (type === 'raw') {
        item = rawIngredients.find((i) => i._id === value);
      } else if (type === 'semiProcessed') {
        item = semiProcessedItems.find((i) => i._id === value);
      } else if (type === 'purchasedGood') {
        item = purchasedGoods.find((i) => i._id === value);
      }

      if (item) {
        updated[index] = {
          ...updated[index],
          ingredientId: value,
          ingredientName: item.name,
          unit: item.unit,
        };
      }
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    onChange(updated);
  };

  const getIngredientOptions = (type: 'raw' | 'semiProcessed' | 'purchasedGood') => {
    switch (type) {
      case 'raw':
        return rawIngredients;
      case 'semiProcessed':
        return semiProcessedItems;
      case 'purchasedGood':
        return purchasedGoods;
      default:
        return [];
    }
  };

  const getTypeLabel = (type: 'raw' | 'semiProcessed' | 'purchasedGood') => {
    switch (type) {
      case 'raw':
        return 'Raw Ingredient';
      case 'semiProcessed':
        return 'Semi-Processed';
      case 'purchasedGood':
        return 'Purchased Good';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <Label className="text-base font-semibold">{label}</Label>
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
                {/* Ingredient Type - Show only if multiple types allowed */}
                {allowedTypes.length > 1 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Type <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={ingredient.ingredientType}
                      onValueChange={(value) =>
                        updateIngredient(index, 'ingredientType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {allowedTypes.includes('raw') && (
                          <SelectItem value="raw">Raw Ingredient</SelectItem>
                        )}
                        {allowedTypes.includes('semiProcessed') && (
                          <SelectItem value="semiProcessed">Semi-Processed</SelectItem>
                        )}
                        {allowedTypes.includes('purchasedGood') && (
                          <SelectItem value="purchasedGood">Purchased Good</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Ingredient Select */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    {getTypeLabel(ingredient.ingredientType)} <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={ingredient.ingredientId}
                    onValueChange={(value) =>
                      updateIngredient(index, 'ingredientId', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {ingredient.ingredientId && ingredient.ingredientName
                          ? `${ingredient.ingredientName} (${ingredient.unit})`
                          : 'Select ingredient'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getIngredientOptions(ingredient.ingredientType).map((item: any) => (
                        <SelectItem key={item._id} value={item._id}>
                          {item.name} ({item.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quantity and Unit */}
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
  );
}
