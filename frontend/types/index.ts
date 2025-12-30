// Type definitions for QSR Inventory Management System

// Polymorphic ingredient reference - can be raw, semiProcessed, or purchasedGood
export interface IngredientReference {
  ingredientType: 'raw' | 'semiProcessed' | 'purchasedGood';
  ingredientId: string;
  ingredientRef: 'RawIngredient' | 'SemiProcessedItem' | 'PurchasedGood';
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface RawIngredient {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  canReplenish: boolean;
  imageUrl?: string;
  supplier?: string;
  category?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SemiProcessedItem {
  _id: string;
  name: string;
  type: 'batch' | 'fixed';
  unit: string;
  currentStock: number;
  batches?: Array<{
    batchId: string;
    quantity: number;
    createdAt: string;
    expiresAt: string;
  }>;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SemiProcessedRecipe {
  _id: string;
  outputName: string;
  outputQuantity: number;
  outputUnit: string;
  ingredients: IngredientReference[];
  instructions?: string;
  level?: number;
  holdingTimeHours?: number;
  storageTemp?: 'chiller_2_4' | 'freezer_minus_18' | 'warm_30_32' | 'room_temp';
  createdAt?: string;
  updatedAt?: string;
}

export interface PurchasedGood {
  _id: string;
  name: string;
  category: 'frozen_pastry' | 'dairy' | 'condiment' | 'topping' | 'other';
  unit: string;
  currentStock: number;
  counterStock: number;
  reorderLevel: number;
  supplier?: string;
  requiresPrep?: boolean;
  prepInstructions?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SkuItem {
  _id: string;
  name: string;
  targetSkus: number;
  currentStallStock: number;
  lowStockThreshold: number;
  price: number;
  isActive: boolean;
  imageUrl?: string;
  category?: 'bakery' | 'beverage' | 'food' | 'other';
  requiresAssembly?: boolean;
  assemblyLocation?: 'kitchen' | 'counter' | 'none';
  createdAt?: string;
  updatedAt?: string;
}

export interface SkuRecipe {
  _id: string;
  skuId: string;
  skuName: string;
  hasRecipe?: boolean;
  ingredients: IngredientReference[];
  assemblyInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BatchCookingLog {
  _id: string;
  semiProcessedRecipeId: string;
  outputName: string;
  quantityProduced: number;
  unit: string;
  batchId: string;
  ingredientsUsed: IngredientReference[];
  createdBy: string;
  createdAt: string;
}

export interface TransferLog {
  _id: string;
  status: 'completed';
  skuId: string;
  skuName: string;
  quantity: number;
  ingredientsUsed: IngredientReference[];
  sentAt: string;
  sentBy: string;
  receivedAt: string;
  receivedBy: string;
  createdAt?: string;
}

export interface SalesLog {
  _id: string;
  skuId: string;
  skuName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  soldBy: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: 'cash' | 'upi' | 'card' | 'other';
  transactionId?: string;
  createdAt: string;
}

export interface CartItem {
  sku: SkuItem;
  quantity: number;
}

export interface CartSaleItem {
  skuId: string;
  skuName: string;
  quantity: number;
  price: number;
  itemTotal: number;
}

// UNIFIED TRANSACTION TYPE (NEW - single source of truth)
export interface TransactionItem {
  skuId: string;
  skuName: string;
  quantity: number;
  unitPrice: number;
  itemTotal: number;
}

export interface Transaction {
  _id: string;
  transactionId: string;
  items: TransactionItem[];
  totalAmount: number;
  itemCount: number;
  soldBy: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod: 'cash' | 'upi' | 'card' | 'other';
  paymentTransactionId?: string;
  transactionType: 'single_item' | 'cart';
  createdAt: string;
  updatedAt: string;
}

// DEPRECATED - Use Transaction instead
export interface CartSale {
  _id: string;
  items: CartSaleItem[];
  totalAmount: number;
  soldBy: string;
  customerName?: string;
  customerPhone?: string;
  paymentMethod?: 'cash' | 'upi' | 'card' | 'other';
  transactionId?: string;
  salesLogIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: string;
  name: string;
  currentStock: number;
  threshold?: number;
  deficit?: number;
  message: string;
  severity?: 'warning' | 'critical';
}

export interface AvailabilityCheck {
  allAvailable: boolean;
  hasRecipe?: boolean;
  items: Array<{
    ingredientType?: 'raw' | 'semiProcessed' | 'purchasedGood';
    itemName: string;
    required: number;
    available: number;
    expired?: number;
    unit: string;
    isAvailable: boolean;
  }>;
}

export interface ExpiringBatch {
  itemName: string;
  batchId: string;
  quantity: number;
  unit: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface ActivityLog {
  _id: string;
  action: string;
  category: 'RAW_INGREDIENT' | 'SEMI_PROCESSED' | 'RECIPE' | 'KITCHEN' | 'SKU' | 'STALL' | 'SYSTEM';
  description: string;
  details: Record<string, any>;
  performedBy: string;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}
