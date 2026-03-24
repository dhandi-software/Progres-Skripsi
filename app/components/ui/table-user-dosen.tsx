import { memo, useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

/* 
  Data Table Component 
  - Optimized with React.memo
  - Handles Loading, Empty State, and Dynamic Columns
*/

export interface Column<T> {
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  cell?: (item: T, index: number) => React.ReactNode;
  className?: string; // Class for both header and cell
  headerClassName?: string;
  cellClassName?: string;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

// Memoized Table Row for performance optimization
const TableRow = memo(
  ({
    item,
    columns,
    index,
    onClick,
  }: {
    item: any;
    columns: Column<any>[];
    index: number;
    onClick?: (item: any) => void;
  }) => {
    return (
      <tr
        onClick={() => onClick && onClick(item)}
        className={cn(
          "hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0",
          onClick && "cursor-pointer"
        )}
      >
        {columns.map((col, colIndex) => (
          <td
            key={colIndex}
            className={cn(
              "px-6 py-4 text-sm text-gray-700 align-middle",
              col.className,
              col.cellClassName
            )}
            style={{ width: col.width }}
          >
            {col.cell
              ? col.cell(item, index)
              : col.accessorKey
              ? item[col.accessorKey]
              : null}
          </td>
        ))}
      </tr>
    );
  }
);
TableRow.displayName = "TableRow";

export function DataTable<T extends { id?: string | number }>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No data found.",
  onRowClick,
  className,
}: DataTableProps<T>) {
  return (
    <div
      className={cn(
        "bg-white border border-gray-200 rounded-xl overflow-hidden w-full",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={cn(
                    "px-6 py-4 font-semibold text-gray-700 text-sm whitespace-nowrap",
                    col.className,
                    col.headerClassName
                  )}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-64 text-center align-middle"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin w-8 h-8 text-[#D25026]" />
                    <span className="text-sm">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="h-64 text-center align-middle text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={item.id || index}
                  item={item}
                  columns={columns}
                  index={index}
                  onClick={onRowClick}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
