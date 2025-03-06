export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export enum TicketType {
  SUPPORT = 'support/billing',
  TECHNICAL = 'support/technical',
  GENERAL = 'support/general',
}

export interface TicketMessage {
  _id?: string;
  comments: string;
  commentBy: string;
}

export interface Ticket {
  _id?: string;
  ticketId: string;
  ticketType: TicketType;
  customerId: string;
  messages: TicketMessage[];
  ticketStatus: TicketStatus;
}

export interface FormField {
  value: string;
  error: string;
}

export interface TicketFormFields {
  ticketId: FormField;
  ticketType: FormField;
  customerId: FormField;
  ticketStatus: FormField;
  messages: TicketMessage[];
  newMessage: FormField;
}
