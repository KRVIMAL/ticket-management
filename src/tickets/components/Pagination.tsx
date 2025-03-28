import { memo, FC } from 'react';

import {
  HiChevronLeft,
  HiChevronRight,
  HiChevronDoubleRight,
  HiChevronDoubleLeft,
} from 'react-icons/hi2';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const totalPages = Math.ceil(totalItems / limit);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`rounded-md px-3 py-1 ${
            currentPage === i
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="mt-6 flex items-center justify-between rounded-lg border bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Limit:</span>
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded border bg-white px-2 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="First Page"
        >
          <HiChevronDoubleLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Previous Page"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>

        <div className="mx-2 flex items-center gap-1">
          {renderPageNumbers()}
        </div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Next Page"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="rounded-md p-2 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          title="Last Page"
        >
          <HiChevronDoubleRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  );
};

export default memo(Pagination);
