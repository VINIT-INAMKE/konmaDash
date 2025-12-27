// Type definitions for QSR Inventory Management System

export interface RawIngredient {
  _id: string;
  name: string;
  unit: string;
  currentStock: number;
  reorderLevel: number;
  canReplenish: boolean;
  imageUrl?: string;
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
  ingredients: Array<{
    rawIngredientId: string;
    rawIngredientName: string;
    quantity: number;
    unit: string;
  }>;
  instructions?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface SkuRecipe {
  _id: string;
  skuId: string;
  skuName: string;
  ingredients: Array<{
    semiProcessedId: string;
    semiProcessedName: string;
    quantity: number;
    unit: string;
  }>;
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
  rawIngredientsUsed: Array<{
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    unit: string;
  }>;
  createdBy: string;
  createdAt: string;
}

export interface TransferLog {
  _id: string;
  status: 'completed';
  skuId: string;
  skuName: string;
  quantity: number;
  semiProcessedUsed: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string;
  }>;
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
  items: Array<{
    itemName: string;
    required: number;
    available: number;
    unit: string;
    isAvailable: boolean;
  }>;
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
