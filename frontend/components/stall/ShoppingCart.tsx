'use client';

import { useState } from 'react';
import { CartItem } from '@/types';
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
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart as CartIcon, 
  Trash2, 
  Minus, 
  Plus, 
  CreditCard,
  Loader2,
  AlertTriangle 
} from 'lucide-react';

interface ShoppingCartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (skuId: string, newQuantity: number) => void;
  onRemoveItem: (skuId: string) => void;
  onClearCart: () => void;
  onCheckout: (customerInfo: {
    customerName: string;
    customerPhone: string;
    paymentMethod: 'cash' | 'upi' | 'card' | 'other';
    transactionId: string;
  }) => void;
  isLoading?: boolean;
  className?: string;
}

export function ShoppingCart({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
  isLoading = false,
  className = ""
}: ShoppingCartProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'other'>('cash');
  const [transactionId, setTransactionId] = useState('');

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.sku.price * item.quantity), 0);
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    onCheckout({
      customerName,
      customerPhone,
      paymentMethod,
      transactionId: paymentMethod !== 'cash' ? transactionId : ''
    });
  };

  const updateQuantity = (skuId: string, delta: number) => {
    const item = cartItems.find(item => item.sku._id === skuId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      if (newQuantity <= item.sku.currentStallStock) {
        onUpdateQuantity(skuId, newQuantity);
      }
    }
  };

  const isCheckoutDisabled = 
    cartItems.length === 0 || 
    isLoading ||
    (paymentMethod !== 'cash' && !transactionId.trim()) ||
    cartItems.some(item => item.quantity > item.sku.currentStallStock);

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {/* Cart Header */}
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CartIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Shopping Cart</h2>
          </div>
          {cartItems.length > 0 && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {itemCount} {itemCount === 1 ? 'item' : 'items'}
            </Badge>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <ScrollArea className="flex-1 p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <CartIcon className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">Your cart is empty</p>
            <p className="text-xs mt-1">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cartItems.map((item) => {
              const isLowStock = item.sku.currentStallStock <= item.sku.lowStockThreshold;
              const isOverStock = item.quantity > item.sku.currentStallStock;
              
              return (
                <Card key={item.sku._id} className={`p-3 ${isOverStock ? 'border-destructive bg-destructive/5' : ''}`}>
                  <div className="space-y-2">
                    {/* Item Name & Price */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium leading-tight line-clamp-2">
                          {item.sku.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-semibold text-primary">
                            ₹{item.sku.price}
                          </span>
                          {isLowStock && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.sku._id)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quantity Controls & Stock Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.sku._id, -1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        
                        <span className="text-sm font-medium min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.sku._id, 1)}
                          disabled={item.quantity >= item.sku.currentStallStock}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          ₹{(item.sku.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Stock: {item.sku.currentStallStock}
                        </div>
                      </div>
                    </div>

                    {/* Stock Warning */}
                    {isOverStock && (
                      <div className="flex items-center gap-1 text-xs text-destructive">
                        <AlertTriangle className="h-3 w-3" />
                        Quantity exceeds available stock ({item.sku.currentStallStock})
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Cart Footer */}
      {cartItems.length > 0 && (
        <div className="border-t bg-muted/50">
          {/* Total */}
          <div className="p-4 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-primary">
                ₹{cartTotal.toFixed(2)}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearCart}
              className="w-full mt-2 text-muted-foreground"
            >
              Clear Cart
            </Button>
          </div>

          <Separator />

          {/* Customer Info */}
          <div className="p-4 space-y-3">
            <h3 className="text-sm font-semibold">Customer Information</h3>
            
            <div className="space-y-2">
              <div>
                <Label htmlFor="cart-customer-name" className="text-xs">Name (Optional)</Label>
                <Input
                  id="cart-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer name"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="cart-customer-phone" className="text-xs">Phone (Optional)</Label>
                <Input
                  id="cart-customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Phone number"
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label htmlFor="cart-payment-method" className="text-xs">Payment Method</Label>
                <Select 
                  value={paymentMethod} 
                  onValueChange={(value: 'cash' | 'upi' | 'card' | 'other') => {
                    setPaymentMethod(value);
                    if (value === 'cash') setTransactionId('');
                  }}
                >
                  <SelectTrigger id="cart-payment-method" className="h-8 text-xs">
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

              {paymentMethod !== 'cash' && (
                <div>
                  <Label htmlFor="cart-transaction-id" className="text-xs">Transaction ID *</Label>
                  <Input
                    id="cart-transaction-id"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="Enter POS transaction ID"
                    className="h-8 text-xs"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Checkout Button */}
          <div className="p-4 pt-0">
            <Button
              onClick={handleCheckout}
              disabled={isCheckoutDisabled}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Checkout - ₹{cartTotal.toFixed(2)}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}