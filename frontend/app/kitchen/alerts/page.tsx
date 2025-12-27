'use client';

import { useState, useEffect } from 'react';
import { Alert } from '@/types';
import { alertsApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlertsPage() {
  const [lowStockSkus, setLowStockSkus] = useState<Alert[]>([]);
  const [lowRawIngredients, setLowRawIngredients] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    const [skusResult, rawResult] = await Promise.all([
      alertsApi.getLowStockSkus(),
      alertsApi.getLowRawIngredients(),
    ]);

    if (skusResult.success && skusResult.data) {
      setLowStockSkus(skusResult.data as Alert[]);
    }

    if (rawResult.success && rawResult.data) {
      setLowRawIngredients(rawResult.data as Alert[]);
    }

    setLoading(false);
  };

  const totalAlerts = lowStockSkus.length + lowRawIngredients.length;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Alerts</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Monitor low stock items that need attention
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Header with Refresh */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                  Alerts & Low Stock
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Monitor low stock items
                </p>
              </div>
            </div>
            <Button onClick={loadAlerts} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3 sm:p-4 bg-destructive/10 rounded-lg">
              <p className="text-xs sm:text-sm text-destructive mb-1">Total Alerts</p>
              <p className="text-2xl sm:text-3xl font-bold text-destructive">
                {totalAlerts}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-accent rounded-lg">
              <p className="text-xs sm:text-sm text-accent-foreground mb-1">
                Low Stock SKUs
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-accent-foreground">
                {lowStockSkus.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                Low Raw Ingredients
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {lowRawIngredients.length}
              </p>
            </div>
          </div>
        </Card>

        {/* Low Stock SKUs */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-accent-foreground" />
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
              Low Stock SKUs (Counter)
            </h3>
            <Badge variant="destructive">{lowStockSkus.length}</Badge>
          </div>

          {lowStockSkus.length > 0 ? (
            <div className="space-y-3">
              {lowStockSkus.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3 sm:p-4 border-l-4 border-accent bg-accent/10 rounded"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{alert.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Current Stock
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">
                        {alert.currentStock}
                      </p>
                      {alert.threshold && (
                        <p className="text-xs text-muted-foreground">
                          Threshold: {alert.threshold}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <p className="text-sm sm:text-base">
                No low stock SKUs. All counter stock levels are good!
              </p>
            </div>
          )}
        </Card>

        {/* Low Raw Ingredients */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
              Low Raw Ingredients
            </h3>
            <Badge variant="destructive">{lowRawIngredients.length}</Badge>
          </div>

          {lowRawIngredients.length > 0 ? (
            <div className="space-y-3">
              {lowRawIngredients.map((alert) => (
                <div
                  key={alert._id}
                  className="p-3 sm:p-4 border-l-4 border-destructive bg-destructive/10 rounded"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{alert.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {alert.message}
                      </p>
                      {alert.severity === 'critical' && (
                        <Badge variant="destructive" className="mt-2">
                          CRITICAL - Cannot Cook
                        </Badge>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Current Stock
                      </p>
                      <p className="text-xl sm:text-2xl font-bold text-destructive">
                        {alert.currentStock}
                      </p>
                      {alert.deficit !== undefined && (
                        <p className="text-xs text-destructive font-medium mt-1">
                          Deficit: {alert.deficit}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <p className="text-sm sm:text-base">
                No low raw ingredients. All ingredient levels are sufficient!
              </p>
            </div>
          )}
        </Card>

        {/* All Clear */}
        {totalAlerts === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center bg-accent border-accent">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-accent-foreground mb-2">
              All Clear!
            </h3>
            <p className="text-sm sm:text-base text-accent-foreground">
              No alerts at this time. All stock levels are healthy.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
