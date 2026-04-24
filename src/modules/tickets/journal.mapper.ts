import { InternalJournalEntry } from '../../models/internalTicket';
import { ServiceNowJournalField } from './types';

function toJournalType(
  element?: string | null
): 'comment' | 'work_note' | null {
  if (element === 'comments') return 'comment';
  if (element === 'work_notes') return 'work_note';
  return null;
}

export function mapJournalEntries(
  items: ServiceNowJournalField[]
): {
  comments: InternalJournalEntry[];
  workNotes: InternalJournalEntry[];
} {
  const comments: InternalJournalEntry[] = [];
  const workNotes: InternalJournalEntry[] = [];

  for (const item of items) {
    const type = toJournalType(item.element);
    if (!type) continue;

    const mapped: InternalJournalEntry = {
      id: item.sys_id,
      type,
      text: item.value ?? '',
      createdAt: item.sys_created_on ?? null,
      createdBy: item.sys_created_by ?? null
    };

    if (type === 'comment') comments.push(mapped);
    if (type === 'work_note') workNotes.push(mapped);
  }

  return { comments, workNotes };
}