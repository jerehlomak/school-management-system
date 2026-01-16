
import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((data: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey: keyof T;
  emptyMessage?: string;
  caption?: string;
  itemsPerPage?: number;

  // Manual Pagination Props
  manualPagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  emptyMessage = 'No data available.',
  caption,
  itemsPerPage = 10, // Changed default to 10

  manualPagination = false,
  totalItems = 0,
  currentPage: propPage = 1,
  onPageChange,
}: TableProps<T>) => {
  const [internalPage, setInternalPage] = React.useState(1);

  // Use propPage if manual, otherwise internalPage
  const currentPage = manualPagination ? propPage : internalPage;

  // Reset internal page if data length changes (only for auto pagination)
  React.useEffect(() => {
    if (!manualPagination) {
      setInternalPage(1);
    }
  }, [data.length, manualPagination]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  // Calculate Pagination Values
  const totalCount = manualPagination ? totalItems : data.length;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Determine Data to Display
  // If manual, data is already sliced (the current page data).
  // If auto, slice data based on internalPage.
  const currentData = manualPagination
    ? data
    : data.slice((internalPage - 1) * itemsPerPage, internalPage * itemsPerPage);

  // Determine start/end indices for "Showing X to Y of Z" text
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  const handlePrev = () => {
    const newPage = Math.max(currentPage - 1, 1);
    if (manualPagination) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleNext = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    if (manualPagination) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200 bg-white flex flex-col">
      <table className="min-w-full divide-y divide-gray-200">
        {caption && (
          <caption className="p-4 text-left text-lg font-semibold text-gray-900">
            {caption}
          </caption>
        )}
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.headerClassName || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {currentData.map((row) => (
            <tr key={String(row[rowKey])} className="hover:bg-gray-50 transition-colors">
              {columns.map((column, colIndex) => (
                <td
                  key={colIndex}
                  className={`px-6 py-4 whitespace-nowrap text-sm text-gray-700 ${column.className || ''}`}
                >
                  {typeof column.accessor === 'function'
                    ? column.accessor(row)
                    : row[column.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{totalCount}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm font-medium rounded-md border ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 text-sm font-medium rounded-md border ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
