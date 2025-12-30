'use client';

import { useState, useEffect, useRef } from 'react';
import { SkuItem, CartItem, Transaction } from '@/types';
import { skuItemsApi, stallApi, printApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart as CartIcon, 
  AlertTriangle, 
  Printer, 
  Image as ImageIcon, 
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { Receipt } from '@/components/stall/Receipt';
import { ShoppingCart } from '@/components/stall/ShoppingCart';

export default function RecordSalePage() {
  const [skus, setSkus] = useState<SkuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [printing, setPrinting] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = async () => {
    if (!lastTransaction) return;

    setPrinting(true);
    try {
      const result = await printApi.printCartReceipt({
        cartSaleData: lastTransaction,
        businessInfo: {
          name: 'Konma Xperience Centre',
          address: 'Block 60, Villa 14, Bollineni Hillside, Nookampalayam, Phase 1, Perumbakkam, Chennai, Tamil Nadu 600131',
          phone: '7709262997',
        }
      });

      if (result.success) {
        toast({
          title: 'Receipt Printed',
          description: 'Cart receipt sent to thermal printer successfully',
        });
      } else {
        toast({
          title: 'Print Failed',
          description: result.error || 'Failed to print receipt',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Print Error',
        description: 'Could not connect to printer. Please check USB connection.',
        variant: 'destructive',
      });
    } finally {
      setPrinting(false);
    }
  };

  useEffect(() => {
    loadSkus();
  }, []);

  // Keyboard shortcuts (1-9 for top 9 items)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle number keys 1-9
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const index = parseInt(e.key) - 1;
        if (index < filteredSkus.length && index < 9) {
          // Check if we're not focused on an input
          const activeElement = document.activeElement;
          if (activeElement?.tagName !== 'INPUT' && activeElement?.tagName !== 'TEXTAREA') {
            addToCart(filteredSkus[index]);
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

  // Filter SKUs based on search and category
  const filteredSkus = skus.filter(sku => {
    const matchesSearch = sku.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || sku.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(skus.map(sku => sku.category).filter(Boolean)))];

  const addToCart = (sku: SkuItem, quantity = 1) => {
    const existingItem = cartItems.find(item => item.sku._id === sku._id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity <= sku.currentStallStock) {
        setCartItems(cartItems.map(item => 
          item.sku._id === sku._id 
            ? { ...item, quantity: newQuantity }
            : item
        ));
        toast({
          title: 'Added to Cart',
          description: `${quantity} ${sku.name} added to cart`,
        });
      } else {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${sku.currentStallStock} units available`,
          variant: 'destructive',
        });
      }
    } else {
      if (quantity <= sku.currentStallStock) {
        setCartItems([...cartItems, { sku, quantity }]);
        toast({
          title: 'Added to Cart',
          description: `${quantity} ${sku.name} added to cart`,
        });
      } else {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${sku.currentStallStock} units available`,
          variant: 'destructive',
        });
      }
    }
  };

  const updateCartQuantity = (skuId: string, newQuantity: number) => {
    setCartItems(cartItems.map(item => 
      item.sku._id === skuId 
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (skuId: string) => {
    setCartItems(cartItems.filter(item => item.sku._id !== skuId));
    toast({
      title: 'Removed from Cart',
      description: 'Item removed from cart',
    });
  };

  const clearCart = () => {
    setCartItems([]);
    toast({
      title: 'Cart Cleared',
      description: 'All items removed from cart',
    });
  };

  const handleCheckout = async (customerInfo: {
    customerName: string;
    customerPhone: string;
    paymentMethod: 'cash' | 'upi' | 'card' | 'other';
    transactionId: string;
  }) => {
    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to cart before checkout',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    try {
      const cartItemsData = cartItems.map(item => ({
        skuId: item.sku._id,
        quantity: item.quantity
      }));

      const result = await stallApi.createTransaction({
        items: cartItemsData,
        customerName: customerInfo.customerName,
        customerPhone: customerInfo.customerPhone,
        paymentMethod: customerInfo.paymentMethod,
        paymentTransactionId: customerInfo.transactionId
      });

      if (result.success) {
        const transactionData = result as unknown as {
          transaction: Transaction;
          totalAmount: number;
          itemCount: number;
        };

        setLastTransaction(transactionData.transaction);
        
        toast({
          title: 'Sale Recorded Successfully!',
          description: `Sold ${transactionData.itemCount} items. Total: ₹${transactionData.totalAmount}`,
        });

        // Clear cart and reload inventory
        setCartItems([]);
        loadSkus();
      } else {
        toast({
          title: 'Sale Failed',
          description: result.error || 'Failed to record cart sale',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left Panel - Products */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Record Sale</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-2">
            Add items to cart and checkout
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            💡 Tip: Press 1-9 to quickly add items to cart
          </p>
        </div>

        {/* Search & Filters */}
        <Card className="p-4 mb-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-48">
              <Button
                variant="outline"
                onClick={() => setCategoryFilter('all')}
                className={`w-full justify-start ${categoryFilter === 'all' ? 'bg-primary/10' : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" />
                All Categories
              </Button>
            </div>
          </div>
        </Card>

        {/* Product Grid */}
        <Card className="p-4 flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Products</h2>
            <Badge variant="secondary">
              {filteredSkus.length} items
            </Badge>
          </div>
          
          <div className="h-[calc(100%-3rem)] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredSkus.map((sku, index) => {
                const isLow = sku.currentStallStock <= sku.lowStockThreshold;
                const isOutOfStock = sku.currentStallStock === 0;
                const inCart = cartItems.find(item => item.sku._id === sku._id);
                const showKeyboardHint = index < 9;

                return (
                  <Card
                    key={sku._id}
                    className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                      isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                    } ${isLow && !isOutOfStock ? 'border-amber-300 bg-amber-50' : ''} ${
                      inCart ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => !isOutOfStock && addToCart(sku)}
                  >
                    {/* Keyboard Shortcut Badge */}
                    {showKeyboardHint && (
                      <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                        {index + 1}
                      </div>
                    )}

                    {/* In Cart Badge */}
                    {inCart && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-1 z-10">
                        {inCart.quantity}
                      </div>
                    )}

                    <div className="p-3">
                      {/* Image */}
                      <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden flex items-center justify-center">
                        {sku.imageUrl ? (
                          <img
                            src={sku.imageUrl}
                            alt={sku.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>

                      {/* Info */}
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[2.5rem] leading-tight">
                        {sku.name}
                      </h3>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Stock:</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-sm font-semibold ${
                              isOutOfStock ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-foreground'
                            }`}>
                              {sku.currentStallStock}
                            </span>
                            {(isLow || isOutOfStock) && (
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Price:</span>
                          <span className="text-sm font-bold text-primary">₹{sku.price}</span>
                        </div>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(sku);
                        }}
                        disabled={isOutOfStock}
                        size="sm"
                        className="w-full mt-2 h-7 text-xs"
                        variant={inCart ? "secondary" : "default"}
                      >
                        {isOutOfStock ? (
                          'Out of Stock'
                        ) : inCart ? (
                          <>Already in Cart</>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>

            {filteredSkus.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CartIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No products found</p>
                <p className="text-xs mt-1">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right Panel - Shopping Cart */}
      <div className="w-96">
        <ShoppingCart
          cartItems={cartItems}
          onUpdateQuantity={updateCartQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          onCheckout={handleCheckout}
          isLoading={loading}
        />
      </div>

      {/* Receipt Modal/Section - Only show when there's a recent cart sale */}
      {lastTransaction && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b bg-muted/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Sale Complete!</h2>
              <div className="flex gap-2">
                <Button onClick={handlePrint} variant="outline" size="sm" disabled={printing}>
                  <Printer className="w-4 h-4 mr-2" />
                  {printing ? 'Printing...' : 'Print'}
                </Button>
                <Button onClick={() => setLastTransaction(null)} variant="ghost" size="sm">
                  Close
                </Button>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-lg">Transaction Complete</h3>
                <p className="text-3xl font-bold text-primary">₹{lastTransaction.totalAmount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  {lastTransaction.items.length} item{lastTransaction.items.length !== 1 ? 's' : ''} sold
                </p>
                <Badge variant="secondary" className="text-xs">
                  ID: {lastTransaction.transactionId}
                </Badge>
              </div>
              
              <div className="mt-4 space-y-2">
                {lastTransaction.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.skuName}</span>
                    <span>₹{item.itemTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    )}
    </div>
  );
}
