import {
  InternalJournalEntry,
  InternalPriority,
  InternalStatus,
  InternalTicket,
  InternalUserRef
} from '../../models/internalTicket';

import {
  ServiceNowField,
  ServiceNowIncident,
  ServiceNowJournalField,
  ServiceNowUser
} from './types';

export function getFieldValue(field?: ServiceNowField): string | null {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field.value ?? null;
}

function getFieldLabel(field?: ServiceNowField): string | null {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field.display_value ?? field.value ?? null;
}

function normalizeValueDisplay(field?: ServiceNowField): {
  code: string | null;
  label: string | null;
} {
  return {
    code: getFieldValue(field),
    label: getFieldLabel(field)
  };
}

export function normalizeUserRef(field?: ServiceNowField): InternalUserRef | null {
  if (!field) return null;

  return {
    id: getFieldValue(field),
    name: getFieldLabel(field),
    email: null,
    userName: null
  };
}

export function mapServiceNowUserToInternal(
  user: ServiceNowUser | null,
  fallback?: InternalUserRef | null
): InternalUserRef | null {
  if (!user && !fallback) return null;

  return {
    id: user?.sys_id ?? fallback?.id ?? null,
    name: user?.name ?? fallback?.name ?? null,
    email: user?.email ?? fallback?.email ?? null,
    userName: user?.user_name ?? fallback?.userName ?? null
  };
}

function normalizeJournalType(
  element?: string | null
): 'comment' | 'work_note' | null {
  if (!element) return null;

  const normalized = element.toLowerCase();

  if (normalized === 'comments') return 'comment';
  if (normalized === 'work_notes') return 'work_note';

  return null;
}

export function mapIncidentBase(
  item: ServiceNowIncident
): Omit<InternalTicket, 'comments' | 'workNotes'> {
  const status: InternalStatus = normalizeValueDisplay(item.state);
  const priority: InternalPriority = normalizeValueDisplay(item.priority);

  return {
    source: 'servicenow',
    externalId: getFieldValue(item.sys_id) ?? '',
    ticketNumber: getFieldLabel(item.number) ?? '',
    subject: getFieldLabel(item.short_description) ?? '',
    description: getFieldLabel(item.description) ?? null,

    status,
    priority,

    requester: normalizeUserRef(item.opened_by),
    assignee: normalizeUserRef(item.assigned_to),
    caller: normalizeUserRef(item.caller_id),

    createdAt: getFieldValue(item.sys_created_on),
    updatedAt: getFieldValue(item.sys_updated_on)
  };
}

export function mapJournalEntries(items: ServiceNowJournalField[]): {
  comments: InternalJournalEntry[];
  workNotes: InternalJournalEntry[];
} {
  const comments: InternalJournalEntry[] = [];
  const workNotes: InternalJournalEntry[] = [];

  for (const item of items) {
    const type = normalizeJournalType(item.element);

    if (!type || !item.value) continue;

    const mapped: InternalJournalEntry = {
      id: item.sys_id,
      type,
      text: item.value,
      createdAt: item.sys_created_on ?? null,
      createdBy: item.sys_created_by ?? null
    };

    if (type === 'comment') comments.push(mapped);
    if (type === 'work_note') workNotes.push(mapped);
  }

  return {
    comments,
    workNotes
  };
}