'use client';

import { useState, useEffect } from 'react';
import { SkuItem } from '@/types';
import { skuItemsApi, kitchenApi } from '@/lib/api';
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
import { useToast } from '@/hooks/use-toast';
import { Send, AlertTriangle, CheckCircle } from 'lucide-react';

export default function SendToCounterPage() {
  const [skus, setSkus] = useState<SkuItem[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availability, setAvailability] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSkus();
  }, []);

  useEffect(() => {
    if (selectedSkuId && quantity > 0) {
      checkAvailability();
    } else {
      setAvailability(null);
    }
  }, [selectedSkuId, quantity]);

  const loadSkus = async () => {
    const result = await skuItemsApi.getAll();
    if (result.success && result.data) {
      setSkus(result.data as SkuItem[]);
    }
  };

  const selectedSku = skus.find((s) => s._id === selectedSkuId);

  const checkAvailability = async () => {
    setCheckingAvailability(true);
    const result = await kitchenApi.checkAvailability(selectedSkuId, quantity);
    if (result.success && result.data) {
      setAvailability(result.data as { allAvailable: boolean; items: Array<{ itemName: string; required: number; available: number; unit: string; isAvailable: boolean }> });
    }
    setCheckingAvailability(false);
  };

  const handleSend = async () => {
    if (!selectedSkuId || quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a SKU and enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (!availability?.allAvailable) {
      toast({
        title: 'Insufficient Ingredients',
        description: 'Not enough semi-processed items to make this SKU',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await kitchenApi.sendToCounter({
      skuId: selectedSkuId,
      quantity,
    });

    if (result.success) {
      // Backend returns data directly in result, not in result.data
      const data = result as unknown as { counterStock: number };
      toast({
        title: 'Sent to Counter Successfully!',
        description: `${quantity} ${selectedSku?.name} sent. Counter stock: ${data.counterStock}`,
      });
      setSelectedSkuId('');
      setQuantity(1);
      setAvailability(null);
      loadSkus();
    } else {
      toast({
        title: 'Send Failed',
        description: result.error || 'Failed to send to counter',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Send to Counter</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Transfer assembled SKUs to the counter/stall (instant update)
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Send Form */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sku">Select SKU Item</Label>
              <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                <SelectTrigger id="sku">
                  <SelectValue placeholder="Choose a SKU to send" />
                </SelectTrigger>
                <SelectContent>
                  {skus.map((sku) => (
                    <SelectItem key={sku._id} value={sku._id}>
                      {sku.name} (Counter: {sku.currentStallStock})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSku && (
              <>
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Counter Stock</p>
                    <p className="text-lg font-semibold">
                      {selectedSku.currentStallStock}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target SKUs</p>
                    <p className="text-lg font-semibold">{selectedSku.targetSkus}</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity to Send</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity"
                  />
                </div>

                {/* Availability Check */}
                {checkingAvailability && (
                  <div className="text-sm text-muted-foreground">
                    Checking ingredient availability...
                  </div>
                )}

                {availability && !checkingAvailability && (
                  <Card className="p-4 border-2">
                    {availability.allAvailable ? (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground mb-2">
                            All ingredients available!
                          </p>
                          <div className="space-y-1">
                            {availability.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className="text-sm text-muted-foreground flex justify-between"
                              >
                                <span>{item.itemName}</span>
                                <span>
                                  {item.required} {item.unit} (have: {item.available}{' '}
                                  {item.unit})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium text-destructive mb-2">
                            Insufficient ingredients!
                          </p>
                          <div className="space-y-1">
                            {availability.items.map((item: any, idx: number) => (
                              <div
                                key={idx}
                                className={`text-sm flex justify-between ${
                                  !item.isAvailable
                                    ? 'text-destructive font-medium'
                                    : 'text-muted-foreground'
                                }`}
                              >
                                <span>{item.itemName}</span>
                                <span>
                                  Need: {item.required} {item.unit} | Have:{' '}
                                  {item.available} {item.unit}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                <Button
                  onClick={handleSend}
                  disabled={
                    loading ||
                    !availability?.allAvailable ||
                    checkingAvailability
                  }
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {loading ? 'Sending...' : 'Send to Counter (Instant Update)'}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Empty State */}
        {skus.length === 0 && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No SKU items found. Please add SKU items in the Admin panel first.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
