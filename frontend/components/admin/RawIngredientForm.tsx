'use client';

import { useState } from 'react';
import { RawIngredient } from '@/types';

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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Chicken"
        />
      </div>

      {/* Unit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit *
        </label>
        <select
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        >
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="ml">ml</option>
          <option value="L">L</option>
          <option value="nos">nos</option>
          <option value="pieces">pieces</option>
        </select>
      </div>

      {/* Current Stock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Current Stock *
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.currentStock}
          onChange={(e) =>
            setFormData({ ...formData, currentStock: parseFloat(e.target.value) })
          }
        />
      </div>

      {/* Reorder Level */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Reorder Level *
        </label>
        <input
          type="number"
          required
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.reorderLevel}
          onChange={(e) =>
            setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })
          }
        />
        <p className="text-xs text-gray-500 mt-1">
          Alert when stock falls below this level
        </p>
      </div>

      {/* Can Replenish */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="canReplenish"
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          checked={formData.canReplenish}
          onChange={(e) =>
            setFormData({ ...formData, canReplenish: e.target.checked })
          }
        />
        <label htmlFor="canReplenish" className="ml-2 text-sm text-gray-700">
          Can Replenish
        </label>
        <p className="ml-2 text-xs text-gray-500">
          (Uncheck for fixed/limited items like frozen pastries)
        </p>
      </div>

      {/* Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
