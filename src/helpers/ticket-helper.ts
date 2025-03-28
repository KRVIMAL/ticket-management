import { TicketFormFields, TicketStatus, TicketType } from '../types/ticket';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ticketInsertField = (data?: any): TicketFormFields => {
  const userValue = typeof data?.userId === 'object' ? data?.userId : null;

  return {
    ticketId: {
      value: data?.ticketId ?? '',
      error: '',
    },
    ticketType: {
      value: data?.ticketType ?? '',
      error: '',
    },
    user: {
      value: userValue,
      error: '',
    },
    userEmail: {
      value: userValue?.email ?? '',
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

export const generateTicketId = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getEnvironment = (apiUrl: string) => {
  switch (apiUrl) {
    case 'Local':
      return import.meta.env.VITE_API_DEV_URL;
    case 'Development':
      return import.meta.env.VITE_API_DEV_URL;
    case 'Production':
      return import.meta.env.VITE_API_PROD_URL;
    default:
      return import.meta.env.VITE_API_DEV_URL;
  }
};
