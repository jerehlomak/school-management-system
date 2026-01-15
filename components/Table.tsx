
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
}

const Table = <T extends Record<string, any>>({
  data,
  columns,
  rowKey,
  emptyMessage = 'No data available.',
  caption,
  itemsPerPage = 3, // Default to 3 as requested
}: TableProps<T>) => {
  const [currentPage, setCurrentPage] = React.useState(1);

  // Reset to first page if data changes significantly (optional, but good practice)
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data.length]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm text-center text-gray-600">
        {emptyMessage}
      </div>
    );
  }

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
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
            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, data.length)}</span> of <span className="font-medium">{data.length}</span> results
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
