// API Client for QSR Inventory Management System
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================================
// ADMIN API
// ============================================================================

// Raw Ingredients
export const rawIngredientsApi = {
  getAll: () => apiRequest('/api/admin/raw-ingredients'),
  create: (data: any) =>
    apiRequest('/api/admin/raw-ingredients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/api/admin/raw-ingredients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/api/admin/raw-ingredients/${id}`, { method: 'DELETE' }),
};

// Semi-Processed Items
export const semiProcessedItemsApi = {
  getAll: () => apiRequest('/api/admin/semi-processed-items'),
  create: (data: any) =>
    apiRequest('/api/admin/semi-processed-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/api/admin/semi-processed-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/api/admin/semi-processed-items/${id}`, { method: 'DELETE' }),
};

// Semi-Processed Recipes (Raw → Semi)
export const semiProcessedRecipesApi = {
  getAll: () => apiRequest('/api/admin/semi-processed-recipes'),
  getOne: (id: string) => apiRequest(`/api/admin/semi-processed-recipes/${id}`),
  create: (data: any) =>
    apiRequest('/api/admin/semi-processed-recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/api/admin/semi-processed-recipes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/api/admin/semi-processed-recipes/${id}`, { method: 'DELETE' }),
};

// SKU Items
export const skuItemsApi = {
  getAll: () => apiRequest('/api/admin/sku-items'),
  getOne: (id: string) => apiRequest(`/api/admin/sku-items/${id}`),
  create: (data: any) =>
    apiRequest('/api/admin/sku-items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    apiRequest(`/api/admin/sku-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest(`/api/admin/sku-items/${id}`, { method: 'DELETE' }),
};

// SKU Recipes (Semi → SKU)
export const skuRecipesApi = {
  getAll: () => apiRequest('/api/admin/sku-recipes'),
  getBySku: (skuId: string) =>
    apiRequest(`/api/admin/sku-recipes/by-sku/${skuId}`),
  create: (data: any) =>
    apiRequest('/api/admin/sku-recipes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (skuId: string, data: any) =>
    apiRequest(`/api/admin/sku-recipes/by-sku/${skuId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (skuId: string) =>
    apiRequest(`/api/admin/sku-recipes/by-sku/${skuId}`, { method: 'DELETE' }),
};

// ============================================================================
// KITCHEN API
// ============================================================================

export const kitchenApi = {
  // Batch Cooking
  cookBatch: (data: { recipeId: string; multiplier: number; createdBy: string }) =>
    apiRequest('/api/kitchen/batch-cook', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBatchLogs: () => apiRequest('/api/kitchen/batch-logs'),

  // Semi-Processed Inventory
  getSemiProcessedInventory: () => apiRequest('/api/kitchen/semi-processed'),

  // Transfers (Send to Counter - SINGLE ACTION)
  sendToCounter: (data: { skuId: string; quantity: number; sentBy: string }) =>
    apiRequest('/api/kitchen/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getTransfers: () => apiRequest('/api/kitchen/transfers'),

  // Check Availability
  checkAvailability: (skuId: string, quantity: number) =>
    apiRequest(`/api/kitchen/check-availability?skuId=${skuId}&quantity=${quantity}`),
};

// ============================================================================
// STALL/COUNTER API
// ============================================================================

export const stallApi = {
  // Transfers (deprecated - counter stock auto-updated)
  getPendingTransfers: () => apiRequest('/api/stall/pending-transfers'),
  getTransferHistory: () => apiRequest('/api/stall/transfer-history'),

  // Inventory
  getInventory: () => apiRequest('/api/stall/inventory'),

  // Sales
  recordSale: (data: {
    skuId: string;
    quantity: number;
    soldBy: string;
    customerName?: string;
    customerPhone?: string;
    paymentMethod?: string;
  }) =>
    apiRequest('/api/stall/sale', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSales: (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams(params as any).toString();
    return apiRequest(`/api/stall/sales${queryParams ? `?${queryParams}` : ''}`);
  },
  getSalesSummary: () => apiRequest('/api/stall/sales-summary'),
};

// ============================================================================
// ALERTS API
// ============================================================================

export const alertsApi = {
  getAll: () => apiRequest('/api/alerts'),
  getLowStockSkus: () => apiRequest('/api/alerts/low-stock'),
  getLowRawIngredients: () => apiRequest('/api/alerts/low-raw'),
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = () => apiRequest('/health');

// ============================================================================
// ACTIVITY LOGS
// ============================================================================

export const logsApi = {
  getAll: (params?: { category?: string; action?: string; limit?: number; skip?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skip) queryParams.append('skip', params.skip.toString());

    const queryString = queryParams.toString();
    return apiRequest(`/api/logs${queryString ? `?${queryString}` : ''}`);
  },
};
