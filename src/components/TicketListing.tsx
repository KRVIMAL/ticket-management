"use client"

import { useState, useEffect } from "react"
import { TicketModal } from "./TicketModal"
import { ticketInsertField } from "../helpers/ticket-helper"
import type { Ticket } from "../types/ticket"
import { getTickets, deleteTicket, createTicket, updateTicket } from "../services/ticket.service"
import toast, { Toaster } from "react-hot-toast"
import DeleteConfirmationModal from "./DeleteConfirmationModal"
import Pagination from "./Pagination"

export default function TicketListing() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formField, setFormField] = useState(ticketInsertField())
  const [isEditing, setIsEditing] = useState(false)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null)

  useEffect(() => {
    fetchTickets()
  }, [page, limit])

  const fetchTickets = async () => {
    try {
      setLoading(true)
      const response = await getTickets(page, limit)
      setTickets(response?.data?.tickets)
      setTotal(response?.data?.total)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast.error("Failed to fetch tickets")
      setLoading(false)
    }
  }

  const handleCreateTicket = () => {
    setFormField(ticketInsertField())
    setIsEditing(false)
    setCurrentTicketId(null)
    setIsModalOpen(true)
  }

  const handleEditTicket = (ticket: Ticket) => {
    setFormField(ticketInsertField(ticket))
    setIsEditing(true)
    setCurrentTicketId(ticket._id || null)
    setIsModalOpen(true)
  }

  const handleDeleteClick = (ticketId: string) => {
    setTicketToDelete(ticketId)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (ticketToDelete) {
      try {
        await deleteTicket(ticketToDelete)
        setTickets(tickets?.filter((ticket:any) => ticket._id !== ticketToDelete))
        toast.success("Ticket deleted successfully")
      } catch (error) {
        console.error("Error deleting ticket:", error)
        toast.error("Failed to delete ticket")
      }
    }
    setIsDeleteModalOpen(false)
    setTicketToDelete(null)
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-blue-100 text-blue-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div>
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <button onClick={handleCreateTicket} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Create Ticket
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer ID
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Messages
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {tickets?.map((ticket:any) => (
              <tr key={ticket?.ticketId} className="hover:bg-gray-50">
                <td className="py-4 px-4 text-sm">{ticket?.ticketId}</td>
                <td className="py-4 px-4 text-sm capitalize">{ticket?.ticketType}</td>
                <td className="py-4 px-4 text-sm">{ticket?.customerId}</td>
                  <td className="py-4 px-4 text-sm">
                  {ticket?.messages?.map((message:any, index:any) => (
                      <div key={index} className={index > 0 ? "mt-2" : ""}>
                        <p>{message.comments}</p>
                        <p className="text-xs text-gray-500">By: {message.commentBy}</p>
                      </div>
                    ))}
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.ticketStatus)}`}>
                      {ticket.ticketStatus}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm">
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditTicket(ticket)} className="text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ticket?._id || "")}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalItems={total} limit={limit} onPageChange={setPage} onLimitChange={setLimit} />

      <TicketModal
        isOpenModal={isModalOpen}
        handleUpdateDialogClose={() => setIsModalOpen(false)}
        setFormField={setFormField}
        formField={formField}
        addTicketHandler={async (newTicket) => {
          try {
            if (isEditing && currentTicketId) {
              const updatedTicket = await updateTicket(currentTicketId, newTicket)
              setTickets(tickets?.map((ticket:any) => (ticket?._id === currentTicketId ? updatedTicket : ticket)))
              toast.success("Ticket updated successfully")
            } else {
              const createdTicket = await createTicket(newTicket)
              setTickets([...tickets, createdTicket])
              toast.success("Ticket created successfully")
            }
            setIsModalOpen(false)
            fetchTickets()
          } catch (error) {
            console.error("Error adding/updating ticket:", error)
            toast.error("Failed to save ticket")
          }
        }}
        edit={isEditing}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName="ticket"
      />
    </div>
  )
}

