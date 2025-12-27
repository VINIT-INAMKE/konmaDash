'use client';

import { useState, useEffect, useRef } from 'react';
import { SkuItem } from '@/types';
import { skuItemsApi, stallApi } from '@/lib/api';
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
import { ShoppingCart, AlertTriangle, Printer } from 'lucide-react';
import { Receipt } from '@/components/stall/Receipt';
import { useReactToPrint } from 'react-to-print';

export default function RecordSalePage() {
  const [skus, setSkus] = useState<SkuItem[]>([]);
  const [selectedSkuId, setSelectedSkuId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [soldBy, setSoldBy] = useState('Stall Staff');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'other'>('cash');
  const [loading, setLoading] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  useEffect(() => {
    loadSkus();
  }, []);

  const loadSkus = async () => {
    const result = await skuItemsApi.getAll();
    if (result.success && result.data) {
      setSkus(result.data as SkuItem[]);
    }
  };

  const selectedSku = skus.find((s) => s._id === selectedSkuId);

  const handleSale = async () => {
    if (!selectedSkuId || quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a SKU and enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (selectedSku && quantity > selectedSku.currentStallStock) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${selectedSku.currentStallStock} units available in counter stock`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await stallApi.recordSale({
      skuId: selectedSkuId,
      quantity,
      soldBy,
      customerName,
      customerPhone,
      paymentMethod,
    });

    if (result.success) {
      // Backend returns data directly in result, not in result.data
      const data = result as unknown as {
        remainingStock: number;
        sale: {
          skuName: string;
          quantity: number;
          price: number;
          totalAmount: number;
          soldBy: string;
          customerName?: string;
          customerPhone?: string;
          paymentMethod?: string;
          createdAt: string;
        }
      };

      // Store last sale for receipt
      setLastSale(data.sale);

      toast({
        title: 'Sale Recorded Successfully!',
        description: `Sold ${quantity} ${selectedSku?.name}. Total: ₹${data.sale.totalAmount}. Remaining stock: ${data.remainingStock}`,
      });
      setSelectedSkuId('');
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('cash');
      loadSkus();
    } else {
      toast({
        title: 'Sale Failed',
        description: result.error || 'Failed to record sale',
        variant: 'destructive',
      });
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Record Sale</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Sell SKU items from counter stock to customers
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Sale Form */}
        <Card className="p-4 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="sku">Select SKU Item</Label>
              <Select value={selectedSkuId} onValueChange={setSelectedSkuId}>
                <SelectTrigger id="sku">
                  <SelectValue placeholder="Choose a SKU to sell" />
                </SelectTrigger>
                <SelectContent>
                  {skus.map((sku) => (
                    <SelectItem key={sku._id} value={sku._id}>
                      {sku.name} (Stock: {sku.currentStallStock}) - ₹{sku.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedSku && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-xs text-muted-foreground">Counter Stock</p>
                    <p className={`text-lg font-semibold ${selectedSku.currentStallStock <= selectedSku.lowStockThreshold ? 'text-destructive' : 'text-foreground'}`}>
                      {selectedSku.currentStallStock}
                      {selectedSku.currentStallStock <= selectedSku.lowStockThreshold && (
                        <AlertTriangle className="inline w-4 h-4 ml-1" />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="text-lg font-semibold text-foreground">₹{selectedSku.price}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                    <p className="text-lg font-semibold text-primary">
                      ₹{(selectedSku.price * quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity to Sell</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={selectedSku.currentStallStock}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    placeholder="Enter quantity"
                  />
                  {quantity > selectedSku.currentStallStock && (
                    <p className="text-sm text-destructive mt-1">
                      Quantity exceeds available stock
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="soldBy">Sold By</Label>
                  <Input
                    id="soldBy"
                    value={soldBy}
                    onChange={(e) => setSoldBy(e.target.value)}
                    placeholder="Enter staff name"
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Customer Information (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name (optional)"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customerPhone">Customer Phone</Label>
                      <Input
                        id="customerPhone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Enter phone number (optional)"
                        type="tel"
                      />
                    </div>

                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi' | 'card' | 'other') => setPaymentMethod(value)}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSale}
                  disabled={loading || quantity > selectedSku.currentStallStock || quantity <= 0}
                  className="w-full"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {loading ? 'Recording Sale...' : `Record Sale - ₹${(selectedSku.price * quantity).toFixed(2)}`}
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Last Sale Receipt */}
        {lastSale && (
          <Card className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Last Sale Receipt</h2>
              <Button onClick={handlePrint} variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                Print Receipt
              </Button>
            </div>
            <div className="print:block">
              <Receipt ref={receiptRef} saleData={lastSale} />
            </div>
          </Card>
        )}

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
