import axios from 'axios';
import { Ticket, TicketMessage } from '../../types/ticket';
const API_URL = 'http://localhost:3000/tickets';

export const getTickets = async (
  page = 1,
  limit = 10,
  status?: string,
  type?: string
): Promise<{ data: { tickets: Ticket[]; total: number } }> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) params.append('status', status);
    if (type) params.append('type', type);

    const response = await axios.get(`${API_URL}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createTicket = async (
  ticketData: Omit<Ticket, '_id'>
): Promise<Ticket> => {
  try {
    const response = await axios.post(API_URL, ticketData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateTicket = async (
  id: string,
  updatedData: Partial<Ticket>
): Promise<Ticket> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteTicket = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    throw error;
  }
};

export const addMessageToTicket = async (
  ticketId: string,
  message: TicketMessage
): Promise<Ticket> => {
  try {
    const response = await axios.put(`${API_URL}/${ticketId}`, {
      messages: [message],
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const searchTickets = async (
  searchText: string,
  page = 1,
  limit = 10
): Promise<{ data: { tickets: Ticket[]; total: number } }> => {
  try {
    const response = await axios.get(
      `${API_URL}/search?searchText=${searchText}&page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
