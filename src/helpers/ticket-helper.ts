// import type { TicketFormFields } from "../types/ticket"
// import { TicketStatus, TicketType } from "../types/ticket"

import { TicketFormFields, TicketStatus, TicketType } from '../types/ticket';

export const ticketInsertField = (data?: any): TicketFormFields => {
  return {
    ticketId: {
      value: data?.ticketId ?? '',
      error: '',
    },
    ticketType: {
      value: data?.ticketType ?? '',
      error: '',
    },
    customerId: {
      value: data?.customerId ?? '',
      error: '',
    },
    ticketStatus: {
      value: data?.ticketStatus ?? TicketStatus.OPEN,
      error: '',
    },
    messages: data?.messages ?? [],
    newMessage: {
      value: '',
      error: '',
    },
  };
};

export const ticketTypeOptions = [
  { value: TicketType.SUPPORT, label: 'Support/Billing' },
  { value: TicketType.TECHNICAL, label: 'Support/Technical' },
  { value: TicketType.GENERAL, label: 'Support/General' },
];

export const ticketStatusOptions = [
  { value: TicketStatus.OPEN, label: 'Open' },
  { value: TicketStatus.IN_PROGRESS, label: 'In Progress' },
  { value: TicketStatus.RESOLVED, label: 'Resolved' },
  { value: TicketStatus.CLOSED, label: 'Closed' },
];

export const customerIdOptions = [
  { value: '1', label: 'Customer 1' },
  { value: '2', label: 'Customer 2' },
  { value: '3', label: 'Customer 3' },
  { value: '4', label: 'Customer 4' },
];

export const generateTicketId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
