'use client';

import { useState, useEffect, useRef } from 'react';
import { SalesLog } from '@/types';
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
import { History, RefreshCw, Eye, Printer } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Receipt } from '@/components/stall/Receipt';
import { useReactToPrint } from 'react-to-print';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<SalesLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SalesLog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    setLoading(true);
    const result = await stallApi.getSales();
    if (result.success && result.data) {
      setSales(result.data as SalesLog[]);
    }
    setLoading(false);
  };

  const handleViewDetails = (sale: SalesLog) => {
    setSelectedSale(sale);
    setIsDialogOpen(true);
  };

  const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalItems = sales.reduce((sum, s) => sum + s.quantity, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Sales History</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          View all sales transactions
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                  All Sales Transactions
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Recent 100 sales records
                </p>
              </div>
            </div>
            <Button onClick={loadSales} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-accent rounded-lg">
              <p className="text-xs sm:text-sm text-accent-foreground mb-1">
                Total Transactions
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent-foreground">
                {sales.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                Total Items Sold
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {totalItems}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-primary/10 rounded-lg">
              <p className="text-xs sm:text-sm text-primary mb-1">Total Revenue</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                ₹{totalSales.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Sales Table */}
          {loading ? (
            <div className="w-full p-8 text-center text-muted-foreground">
              Loading sales history...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale._id}>
                      <TableCell>
                        <span className="font-medium">{sale.skuName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg">{sale.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">₹{sale.totalAmount.toFixed(2)}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{sale.customerName || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs uppercase font-medium">{sale.paymentMethod || 'cash'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(sale.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewDetails(sale)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {sales.length === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No sales recorded yet. Start selling items to see transaction history.
            </p>
          </Card>
        )}
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="text-sm font-mono">{selectedSale._id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Date & Time</p>
                  <p className="text-sm">{new Date(selectedSale.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Item</p>
                  <p className="text-sm font-semibold">{selectedSale.skuName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="text-sm font-semibold">{selectedSale.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unit Price</p>
                  <p className="text-sm">₹{selectedSale.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Amount</p>
                  <p className="text-sm font-bold text-primary">₹{selectedSale.totalAmount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sold By</p>
                  <p className="text-sm">{selectedSale.soldBy}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm uppercase font-medium">{selectedSale.paymentMethod || 'Cash'}</p>
                </div>
                {selectedSale.customerName && (
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Name</p>
                    <p className="text-sm">{selectedSale.customerName}</p>
                  </div>
                )}
                {selectedSale.customerPhone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Customer Phone</p>
                    <p className="text-sm">{selectedSale.customerPhone}</p>
                  </div>
                )}
              </div>

              {/* Receipt Preview */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Receipt Preview</h3>
                  <Button onClick={handlePrint} variant="default" size="sm">
                    <Printer className="w-4 h-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
                <Receipt
                  ref={receiptRef}
                  saleData={{
                    skuName: selectedSale.skuName,
                    quantity: selectedSale.quantity,
                    price: selectedSale.price,
                    totalAmount: selectedSale.totalAmount,
                    soldBy: selectedSale.soldBy,
                    customerName: selectedSale.customerName,
                    customerPhone: selectedSale.customerPhone,
                    paymentMethod: selectedSale.paymentMethod,
                    createdAt: selectedSale.createdAt
                  }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
