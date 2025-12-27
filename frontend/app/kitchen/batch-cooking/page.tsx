'use client';

import { useState, useEffect } from 'react';
import { SemiProcessedRecipe } from '@/types';
import { semiProcessedRecipesApi, kitchenApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';

export default function BatchCookingPage() {
  const [recipes, setRecipes] = useState<SemiProcessedRecipe[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    const result = await semiProcessedRecipesApi.getAll();
    if (result.success && result.data) {
      setRecipes(result.data as SemiProcessedRecipe[]);
    }
  };

  const selectedRecipe = recipes.find((r) => r._id === selectedRecipeId);

  const handleCook = async () => {
    if (!selectedRecipeId || multiplier <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a recipe and enter a valid multiplier',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await kitchenApi.cookBatch({
      recipeId: selectedRecipeId,
      multiplier,
    });

    if (result.success) {
      // Backend returns data directly in result, not in result.data
      const data = result as unknown as { quantityProduced: number; unit: string; outputName: string };
      toast({
        title: 'Batch Cooked Successfully!',
        description: `Produced ${data.quantityProduced} ${data.unit} of ${data.outputName}`,
      });
      setSelectedRecipeId('');
      setMultiplier(1);
    } else {
      toast({
        title: 'Cooking Failed',
        description: result.error || 'Failed to cook batch',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Batch Cooking</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Cook semi-processed items from raw ingredients
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Recipe Selection */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipe">Select Recipe</Label>
              <Select value={selectedRecipeId} onValueChange={setSelectedRecipeId}>
                <SelectTrigger id="recipe">
                  <SelectValue placeholder="Choose a recipe to cook" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe._id} value={recipe._id}>
                      {recipe.outputName} ({recipe.outputQuantity} {recipe.outputUnit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedRecipe && (
              <>
                <div>
                  <Label htmlFor="multiplier">Batch Multiplier</Label>
                  <Input
                    id="multiplier"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={multiplier}
                    onChange={(e) => setMultiplier(parseFloat(e.target.value) || 0)}
                    placeholder="e.g., 1 for single batch, 2 for double"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Will produce: {selectedRecipe.outputQuantity * multiplier}{' '}
                    {selectedRecipe.outputUnit}
                  </p>
                </div>

                <Button onClick={handleCook} disabled={loading} className="w-full">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? 'Cooking...' : 'Cook Batch'}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Recipe Details */}
        {selectedRecipe && (
          <Card className="p-4 sm:p-6">
            <h3 className="font-semibold mb-4">Recipe Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Output</p>
                <p className="font-medium">
                  {selectedRecipe.outputName} - {selectedRecipe.outputQuantity}{' '}
                  {selectedRecipe.outputUnit}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Ingredients Required</p>
                <div className="flex flex-wrap gap-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <Badge key={idx} variant="outline">
                      {ing.rawIngredientName}: {ing.quantity * multiplier} {ing.unit}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedRecipe.instructions && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Instructions</p>
                  <p className="text-sm text-foreground bg-muted p-3 rounded">
                    {selectedRecipe.instructions}
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {recipes.length === 0 && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No recipes found. Please add semi-processed recipes in the Admin panel
              first.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
