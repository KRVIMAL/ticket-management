"use client"

import { useState, useEffect } from "react"
import { TicketModal } from "./TicketModal"

import { getTickets, deleteTicket, createTicket, updateTicket } from "../services/ticket.service"
import { Ticket } from "../types/ticket"
import { ticketInsertField } from "../helpers/ticket-helper"

export default function TicketListing() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formField, setFormField] = useState(ticketInsertField())
  const [isEditing, setIsEditing] = useState(false)
  const [currentTicketId, setCurrentTicketId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  useEffect(() => {
    fetchTickets()
  }, [page])

  const fetchTickets = async () => {
    try {
      const fetchedTickets:any = await getTickets(page, limit)
      setTickets(fetchedTickets?.data?.tickets)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      // Handle error (e.g., show an error message to the user)
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

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await deleteTicket(ticketId)
        setTickets(tickets.filter((ticket:any) => ticket._id !== ticketId))
      } catch (error) {
        console.error("Error deleting ticket:", error)
        // Handle error (e.g., show an error message to the user)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Tickets</h2>
        <button
          onClick={handleCreateTicket}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Create Ticket
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-background border rounded-lg">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Ticket ID
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Type
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Customer ID
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Messages
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="py-3 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tickets?.map((ticket) => (
              <tr key={ticket.ticketId} className="hover:bg-muted/50">
                <td className="py-4 px-4 text-sm">{ticket.ticketId}</td>
                <td className="py-4 px-4 text-sm capitalize">{ticket.ticketType}</td>
                <td className="py-4 px-4 text-sm">{ticket.customerId}</td>
                <td className="py-4 px-4 text-sm">
                  {ticket.messages.map((message, index) => (
                    <div key={index} className={index > 0 ? "mt-2" : ""}>
                      <p>{message.comments}</p>
                      <p className="text-xs text-muted-foreground">By: {message.commentBy}</p>
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
                      onClick={() => handleDeleteTicket(ticket._id || "")}
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

      <TicketModal
        isOpenModal={isModalOpen}
        handleUpdateDialogClose={() => setIsModalOpen(false)}
        setFormField={setFormField}
        formField={formField}
        addTicketHandler={async (newTicket) => {
          try {
            if (isEditing && currentTicketId) {
              const updatedTicket = await updateTicket(currentTicketId, newTicket)
              setTickets(tickets.map((ticket) => (ticket._id === currentTicketId ? updatedTicket : ticket)))
            } else {
              const createdTicket = await createTicket(newTicket)
              setTickets([...tickets, createdTicket])
            }
            setIsModalOpen(false)
            fetchTickets() // Refresh the list after adding/updating
          } catch (error) {
            console.error("Error adding/updating ticket:", error)
            // Handle error (e.g., show an error message to the user)
          }
        }}
        edit={isEditing}
      />
    </div>
  )
}

