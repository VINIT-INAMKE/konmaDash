'use client';

import { useState, useEffect } from 'react';
import { stallApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart3, RefreshCw, TrendingUp } from 'lucide-react';

interface SalesSummaryItem {
  _id: string;
  skuName: string;
  totalQuantity: number;
  totalRevenue: number;
  salesCount: number;
}

export default function SalesSummaryPage() {
  const [summary, setSummary] = useState<SalesSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    const result = await stallApi.getSalesSummary();
    if (result.success && result.data) {
      setSummary(result.data as SalesSummaryItem[]);
    }
    setLoading(false);
  };

  const totalRevenue = summary.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalQuantity = summary.reduce((sum, s) => sum + s.totalQuantity, 0);
  const totalTransactions = summary.reduce((sum, s) => sum + s.salesCount, 0);

  const topSeller = summary.length > 0 ? summary[0] : null;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sales Summary</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          View sales analytics and performance reports
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
                <p className="text-xl sm:text-2xl font-bold text-primary mt-1">
                  ₹{totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Items Sold</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {totalQuantity}
                </p>
              </div>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Transactions</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  {totalTransactions}
                </p>
              </div>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Avg per Transaction</p>
                <p className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                  ₹{totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Seller */}
        {topSeller && (
          <Card className="p-4 sm:p-6 border-primary bg-primary/5">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Top Selling Item</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Item</p>
                <p className="text-base font-semibold text-foreground">{topSeller.skuName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Quantity Sold</p>
                <p className="text-base font-semibold text-primary">{topSeller.totalQuantity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Revenue</p>
                <p className="text-base font-semibold text-foreground">₹{topSeller.totalRevenue.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sales Count</p>
                <p className="text-base font-semibold text-foreground">{topSeller.salesCount}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Table */}
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                  SKU-wise Sales Summary
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Sorted by total quantity sold
                </p>
              </div>
            </div>
            <Button onClick={loadSummary} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="w-full p-8 text-center text-muted-foreground">
              Loading sales summary...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Name</TableHead>
                    <TableHead>Total Quantity Sold</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Sales Count</TableHead>
                    <TableHead>Avg per Sale</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {summary.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell>
                        <span className="font-medium">{item.skuName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg text-primary">{item.totalQuantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg text-foreground">₹{item.totalRevenue.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{item.salesCount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          ₹{(item.totalRevenue / item.salesCount).toFixed(2)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {summary.length === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No sales data available yet. Start recording sales to see analytics.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
