import type React from "react"

import { HiChevronLeft,HiChevronRight, HiChevronDoubleRight, HiChevronDoubleLeft, } from "react-icons/hi2"

interface PaginationProps {
  currentPage: number
  totalItems: number
  limit: number
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, limit, onPageChange, onLimitChange }) => {
  const totalPages = Math.ceil(totalItems / limit)

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          {i}
        </button>,
      )
    }

    return pageNumbers
  }

  return (
    <div className="mt-6 flex items-center justify-between px-4 py-3 bg-white border rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">Limit:</span>
        <select
          value={limit}
          onChange={(e) => {
            onLimitChange(Number(e.target.value))
            onPageChange(1)
          }}
          className="border rounded px-2 py-1 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="First Page"
        >
          <HiChevronDoubleLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Previous Page"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-1 mx-2">{renderPageNumbers()}</div>

        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Next Page"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Last Page"
        >
          <HiChevronDoubleRight className="h-4 w-4" />
        </button>
      </div>

      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
}

export default Pagination

