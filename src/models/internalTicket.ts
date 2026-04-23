export interface InternalTicket {
  source: 'servicenow';
  externalId: string;
  ticketNumber: string;
  subject: string;
  description: string | null;
  status: string | null;
  priority: string | null;
  requesterId: string | null;
  assigneeId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}