'use client';

import { useState, useEffect } from 'react';
import { TransferLog } from '@/types';
import { stallApi } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TrendingUp } from 'lucide-react';

export default function TransferHistoryPage() {
  const [transfers, setTransfers] = useState<TransferLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    setLoading(true);
    const result = await stallApi.getTransferHistory();
    if (result.success && result.data) {
      setTransfers(result.data as TransferLog[]);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Transfer History</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          View SKU items received from kitchen (counter stock auto-updated)
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                Completed Transfers
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Items sent from kitchen to counter
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 bg-accent rounded-lg">
              <p className="text-xs sm:text-sm text-accent-foreground mb-1">
                Total Transfers
              </p>
              <p className="text-xl sm:text-2xl font-bold text-accent-foreground">
                {transfers.length}
              </p>
            </div>
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                Total Items Received
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {transfers.reduce((sum, t) => sum + t.quantity, 0)}
              </p>
            </div>
          </div>

          {/* Transfer Table */}
          {loading ? (
            <div className="w-full p-8 text-center text-muted-foreground">
              Loading transfer history...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU Name</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Sent By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer._id}>
                      <TableCell>
                        <span className="font-medium">{transfer.skuName}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-lg text-primary">{transfer.quantity}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">
                          {transfer.status === 'completed' ? 'Completed' : transfer.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(transfer.sentAt).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{transfer.sentBy}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Info Card */}
        <Card className="p-4 sm:p-6 border-accent bg-accent">
          <p className="text-sm text-accent-foreground">
            <strong>Note:</strong> Counter stock is updated automatically when kitchen sends
            SKUs. No manual receiving action is required.
          </p>
        </Card>

        {/* Empty State */}
        {transfers.length === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No transfer history found. Kitchen hasn't sent any SKUs yet.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
