import { InternalTicket } from '../../models/internalTicket';
import { ServiceNowIncident, ServiceNowReferenceField } from './types';

function extractReferenceValue(
  field?: ServiceNowReferenceField | string | null
): string | null {
  if (!field) return null;
  if (typeof field === 'string') return field;
  return field.value ?? null;
}

export function mapServiceNowIncidentToInternal(
  item: ServiceNowIncident
): InternalTicket {
  return {
    source: 'servicenow',
    externalId: item.sys_id,
    ticketNumber: item.number,
    subject: item.short_description ?? '',
    description: item.description ?? null,
    status: item.state ?? null,
    priority: item.priority ?? null,
    requesterId: extractReferenceValue(item.opened_by),
    assigneeId: extractReferenceValue(item.assigned_to),
    createdAt: item.sys_created_on ?? null,
    updatedAt: item.sys_updated_on ?? null
  };
}