import axios from "axios"
import { Ticket, TicketMessage } from "../types/ticket"
// import type { Ticket, TicketMessage } from "@/types/ticket"
// import type {Ticket} from "../types/ticket"
const API_URL = "http://localhost:3000/tickets"

// Fetch all tickets (Paginated)
export const getTickets = async (
  page = 1,
  limit = 10,
  status?: string,
  type?: string,
): Promise<{ data: { tickets: Ticket[]; total: number } }> => {
  try {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() })
    if (status) params.append("status", status)
    if (type) params.append("type", type)

    const response = await axios.get(`${API_URL}?${params.toString()}`)
    return response.data
  } catch (error) {
    console.error("Error fetching tickets:", error)
    throw error
  }
}
// Fetch a single ticket by ID
export const getTicketById = async (id: string): Promise<Ticket> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`)
    return response.data
  } catch (error) {
    console.error("Error fetching ticket:", error)
    throw error
  }
}

// Create a ticket
export const createTicket = async (ticketData: Omit<Ticket, "_id">): Promise<Ticket> => {
  try {
    const response = await axios.post(API_URL, ticketData)
    return response.data
  } catch (error) {
    console.error("Error creating ticket:", error)
    throw error
  }
}

// Update a ticket
export const updateTicket = async (id: string, updatedData: Partial<Ticket>): Promise<Ticket> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData)
    return response.data
  } catch (error) {
    console.error("Error updating ticket:", error)
    throw error
  }
}

// Delete a ticket
export const deleteTicket = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`)
  } catch (error) {
    console.error("Error deleting ticket:", error)
    throw error
  }
}

// Add a message to a ticket
export const addMessageToTicket = async (ticketId: string, message: TicketMessage): Promise<Ticket> => {
  try {
    const response = await axios.put(`${API_URL}/${ticketId}`, { messages: [message] })
    return response.data
  } catch (error) {
    console.error("Error adding message to ticket:", error)
    throw error
  }
}

export const searchTickets = async (
  searchText: string,
  page = 1,
  limit = 10,
): Promise<{ data: { tickets: Ticket[]; total: number } }> => {
  try {
    const response = await axios.get(`${API_URL}/search?searchText=${searchText}&page=${page}&limit=${limit}`)
    return response.data
  } catch (error) {
    console.error("Error searching tickets:", error)
    throw error
  }
}
