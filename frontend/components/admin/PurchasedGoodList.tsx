'use client';

import { PurchasedGood } from '@/types';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface PurchasedGoodListProps {
  goods: PurchasedGood[];
  onEdit: (good: PurchasedGood) => void;
  onDelete: (id: string) => void;
}

export function PurchasedGoodList({
  goods,
  onEdit,
  onDelete,
}: PurchasedGoodListProps) {
  if (goods.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No purchased goods found. Add your first item above.
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      frozen_pastry: 'bg-blue-100 text-blue-800',
      dairy: 'bg-yellow-100 text-yellow-800',
      condiment: 'bg-green-100 text-green-800',
      topping: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800',
    };
    const labels: Record<string, string> = {
      frozen_pastry: 'Frozen Pastry',
      dairy: 'Dairy',
      condiment: 'Condiment',
      topping: 'Topping',
      other: 'Other',
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[category] || colors.other
        }`}
      >
        {labels[category] || category}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-3 font-semibold">Name</th>
              <th className="text-left p-3 font-semibold">Category</th>
              <th className="text-left p-3 font-semibold">Supplier</th>
              <th className="text-right p-3 font-semibold">Main Stock</th>
              <th className="text-right p-3 font-semibold">Counter</th>
              <th className="text-right p-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goods.map((good) => (
              <tr key={good._id} className="border-b hover:bg-muted/50">
                <td className="p-3 font-medium">{good.name}</td>
                <td className="p-3">{getCategoryBadge(good.category)}</td>
                <td className="p-3 text-muted-foreground">
                  {good.supplier || '-'}
                </td>
                <td className="p-3 text-right">
                  {good.currentStock} {good.unit}
                </td>
                <td className="p-3 text-right">
                  {good.counterStock} {good.unit}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(good)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(good._id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {goods.map((good) => (
          <div key={good._id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{good.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {good.supplier || 'No supplier'}
                </p>
              </div>
              {getCategoryBadge(good.category)}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Main Stock:</span>
                <span className="ml-2 font-medium">
                  {good.currentStock} {good.unit}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Counter:</span>
                <span className="ml-2 font-medium">
                  {good.counterStock} {good.unit}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(good)}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(good._id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
