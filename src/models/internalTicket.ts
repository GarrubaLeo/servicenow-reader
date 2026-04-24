export interface InternalUserRef {
  id: string | null;
  name: string | null;
  email: string | null;
  userName?: string | null;
}

export interface InternalJournalEntry {
  id: string;
  type: 'comment' | 'work_note';
  text: string;
  createdAt: string | null;
  createdBy: string | null;
}

export interface InternalStatus {
  code: string | null;
  label: string | null;
}

export interface InternalPriority {
  code: string | null;
  label: string | null;
}

export interface InternalTicket {
  source: 'servicenow';
  externalId: string;
  ticketNumber: string;
  subject: string;
  description: string | null;

  status: InternalStatus;
  priority: InternalPriority;

  requester: InternalUserRef | null;
  assignee: InternalUserRef | null;
  caller: InternalUserRef | null;

  comments: InternalJournalEntry[];
  workNotes: InternalJournalEntry[];

  createdAt: string | null;
  updatedAt: string | null;
}