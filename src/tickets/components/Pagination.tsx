import { memo, FC } from 'react';
import {
  HiChevronLeft,
  HiChevronRight,
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
          className={`flex h-8 w-8 items-center justify-center rounded-md ${
            currentPage === i
              ? 'bg-blue-500 text-white'
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
    <div className="mt-6 flex items-center justify-between px-2 py-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-[500]">Row Per Page</span>
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded border bg-white px-2 py-1 text-sm focus:outline-none"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="rounded-md p-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiChevronLeft className="h-5 w-5" />
        </button>
        
        <div className="flex items-center gap-1">
          {renderPageNumbers()}
        </div>
        
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="rounded-md p-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <HiChevronRight className="h-5 w-5" />
        </button>
        
        {/* <span className="ml-2 text-gray-500">
          ... {totalPages}
        </span> */}
      </div>
    </div>
  );
};

export default memo(Pagination);