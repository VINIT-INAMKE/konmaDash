'use client';

import { ReactNode } from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  cell?: (value: any, row: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T extends { _id: string }>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id} className="border-b hover:bg-gray-50">
              {columns.map((column, colIndex) => {
                let value: any;

                if (typeof column.accessor === 'function') {
                  value = column.accessor(row);
                } else {
                  value = row[column.accessor];
                }

                const cellContent = column.cell ? column.cell(value, row) : value;

                return (
                  <td key={colIndex} className="px-4 py-3 text-sm">
                    {cellContent}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
