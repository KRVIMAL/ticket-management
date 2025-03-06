"use client"

import type React from "react"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  itemName: string
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, itemName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-6">Are you sure you want to delete this {itemName}? This action cannot be undone.</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal

