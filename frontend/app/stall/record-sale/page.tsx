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
import { ShoppingCart, AlertTriangle, Printer, Image as ImageIcon } from 'lucide-react';
import { Receipt } from '@/components/stall/Receipt';
import { useReactToPrint } from 'react-to-print';

export default function RecordSalePage() {
  const [skus, setSkus] = useState<SkuItem[]>([]);
  const [selectedSku, setSelectedSku] = useState<SkuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'other'>('cash');
  const [transactionId, setTransactionId] = useState('');
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

  // Keyboard shortcuts (1-9 for top 9 items)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle number keys 1-9
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (index < skus.length && index < 9) {
          // Check if we're not focused on an input
          const activeElement = document.activeElement;
          if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
            handleSkuSelect(skus[index]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [skus]);

  const loadSkus = async () => {
    const result = await skuItemsApi.getAll();
    if (result.success && result.data) {
      setSkus(result.data as SkuItem[]);
    }
  };

  const handleSkuSelect = (sku: SkuItem) => {
    setSelectedSku(sku);
    setQuantity(1);
  };

  const handleSale = async () => {
    if (!selectedSku || quantity <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select a SKU and enter a valid quantity',
        variant: 'destructive',
      });
      return;
    }

    if (quantity > selectedSku.currentStallStock) {
      toast({
        title: 'Insufficient Stock',
        description: `Only ${selectedSku.currentStallStock} units available in counter stock`,
        variant: 'destructive',
      });
      return;
    }

    // Validate transaction ID for digital payments
    if (paymentMethod !== 'cash' && !transactionId.trim()) {
      toast({
        title: 'Transaction ID Required',
        description: 'Please enter POS machine transaction ID for digital payments',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const result = await stallApi.recordSale({
      skuId: selectedSku._id,
      quantity,
      customerName,
      customerPhone,
      paymentMethod,
      transactionId: paymentMethod !== 'cash' ? transactionId : '',
    });

    if (result.success) {
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
          transactionId?: string;
          createdAt: string;
        }
      };

      setLastSale(data.sale);

      toast({
        title: 'Sale Recorded Successfully!',
        description: `Sold ${quantity} ${selectedSku.name}. Total: ₹${data.sale.totalAmount}. Remaining stock: ${data.remainingStock}`,
      });
      setSelectedSku(null);
      setQuantity(1);
      setCustomerName('');
      setCustomerPhone('');
      setPaymentMethod('cash');
      setTransactionId('');
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
        <p className="text-xs text-muted-foreground mt-1">
          💡 Tip: Press 1-9 to quickly select items
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* SKU Grid */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Select Item</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {skus.slice(0, 20).map((sku, index) => {
              const isLow = sku.currentStallStock <= sku.lowStockThreshold;
              const isSelected = selectedSku?._id === sku._id;
              const showKeyboardHint = index < 9;

              return (
                <Card
                  key={sku._id}
                  className={`relative cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                  } ${isLow ? 'border-destructive' : ''}`}
                  onClick={() => handleSkuSelect(sku)}
                >
                  {/* Keyboard Shortcut Badge */}
                  {showKeyboardHint && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </div>
                  )}

                  <div className="p-3 sm:p-4">
                    {/* Image */}
                    <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                      {sku.imageUrl ? (
                        <img
                          src={sku.imageUrl}
                          alt={sku.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>

                    {/* Info */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                      {sku.name}
                    </h3>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Stock:</span>
                        <span className={`text-sm font-semibold ${isLow ? 'text-destructive' : 'text-foreground'}`}>
                          {sku.currentStallStock}
                          {isLow && <AlertTriangle className="inline w-3 h-3 ml-1" />}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Price:</span>
                        <span className="text-base font-bold text-primary">₹{sku.price}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {skus.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No SKU items found. Please add SKU items in the Admin panel first.
            </div>
          )}
        </Card>

        {/* Sale Details Form */}
        {selectedSku && (
          <Card className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Sale Details</h2>

            <div className="space-y-4">
              {/* Selected Item Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Selected Item</p>
                  <p className="text-sm font-semibold text-foreground">{selectedSku.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Counter Stock</p>
                  <p className={`text-lg font-semibold ${selectedSku.currentStallStock <= selectedSku.lowStockThreshold ? 'text-destructive' : 'text-foreground'}`}>
                    {selectedSku.currentStallStock}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold text-foreground">₹{selectedSku.price}</p>
                </div>
              </div>

              {/* Quantity */}
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

              {/* Total Amount */}
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-3xl font-bold text-primary">
                  ₹{(selectedSku.price * quantity).toFixed(2)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={(value: 'cash' | 'upi' | 'card' | 'other') => {
                  setPaymentMethod(value);
                  if (value === 'cash') setTransactionId('');
                }}>
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

              {/* Transaction ID for digital payments */}
              {paymentMethod !== 'cash' && (
                <div>
                  <Label htmlFor="transactionId">POS Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter POS machine transaction ID"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Required for UPI/Card/Other payments to track bank transactions
                  </p>
                </div>
              )}

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
                </div>
              </div>

              <Button
                onClick={handleSale}
                disabled={loading || quantity > selectedSku.currentStallStock || quantity <= 0 || (paymentMethod !== 'cash' && !transactionId.trim())}
                className="w-full"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {loading ? 'Recording Sale...' : `Record Sale - ₹${(selectedSku.price * quantity).toFixed(2)}`}
              </Button>
            </div>
          </Card>
        )}

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
      </div>
    </div>
  );
}
