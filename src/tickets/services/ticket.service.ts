/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { Ticket, TicketMessage } from '../../types/ticket';
import { getEnvironment } from '../../helpers/ticket-helper';
const API_URL = getEnvironment(import.meta.env.VITE_API_ENV);

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
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getTicketById = async (id: string): Promise<Ticket> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const createTicket = async (
  ticketData: Omit<Ticket, '_id'>
): Promise<Ticket> => {
  try {
    const response = await axios.post(API_URL, ticketData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateTicket = async (
  id: string,
  updatedData: Partial<Ticket>
): Promise<Ticket> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const deleteTicket = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    throw new Error(error.message);
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
  } catch (error: any) {
    throw new Error(error.message);
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
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const searchUsers = async (page = 1, limit = 10, search = {}) => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_API_USER_API_URL,
      {
        page,
        limit,
        search,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': localStorage.getItem('token') || '',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error.message;
  }
};
