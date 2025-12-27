'use client';

import { useState, useEffect } from 'react';
import { ActivityLog } from '@/types';
import { logsApi } from '@/lib/api';
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
import { FileText, RefreshCw, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    loadLogs();
  }, [category]);

  const loadLogs = async () => {
    setLoading(true);
    const params = category && category !== 'all' ? { category, limit: 200 } : { limit: 200 };
    const result = await logsApi.getAll(params);
    if (result.success && result.data) {
      setLogs(result.data as ActivityLog[]);
    }
    setLoading(false);
  };

  const getCategoryBadgeColor = (cat: string) => {
    const colors: Record<string, string> = {
      RAW_INGREDIENT: 'bg-blue-100 text-blue-800',
      SEMI_PROCESSED: 'bg-purple-100 text-purple-800',
      RECIPE: 'bg-green-100 text-green-800',
      KITCHEN: 'bg-orange-100 text-orange-800',
      SKU: 'bg-pink-100 text-pink-800',
      STALL: 'bg-yellow-100 text-yellow-800',
      SYSTEM: 'bg-gray-100 text-gray-800',
      AUTH: 'bg-indigo-100 text-indigo-800',
      USER: 'bg-teal-100 text-teal-800',
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2">
          Complete system activity history
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-card-foreground">
                  System Activity Log
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {logs.length} records
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="RAW_INGREDIENT">Raw Ingredient</SelectItem>
                  <SelectItem value="SEMI_PROCESSED">Semi Processed</SelectItem>
                  <SelectItem value="RECIPE">Recipe</SelectItem>
                  <SelectItem value="KITCHEN">Kitchen</SelectItem>
                  <SelectItem value="SKU">SKU</SelectItem>
                  <SelectItem value="STALL">Stall</SelectItem>
                  <SelectItem value="SYSTEM">System</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadLogs} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Activity Log Table */}
          {loading ? (
            <div className="w-full p-8 text-center text-muted-foreground">
              Loading activity logs...
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryBadgeColor(log.category)}`}>
                          {log.category.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.description}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{log.performedBy}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {logs.length === 0 && !loading && (
          <Card className="p-6 sm:p-8 text-center">
            <p className="text-muted-foreground">
              No activity logs found. System activities will appear here.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
