import {
  fetchIncidentJournalEntries,
  fetchIncidentsFromServiceNow,
  fetchUserBySysId
} from '../../clients/serviceNowClient';

import { InternalTicket, InternalUserRef } from '../../models/internalTicket';
import {
  getFieldValue,
  mapIncidentBase,
  mapJournalEntries,
  mapServiceNowUserToInternal
} from './mapper';

import { ServiceNowJournalField } from './types';

interface ListTicketsInput {
  limit?: number;
  query?: string;
}

async function enrichUser(
  userRef: InternalUserRef | null
): Promise<InternalUserRef | null> {
  if (!userRef?.id) return userRef;

  try {
    const user = await fetchUserBySysId(userRef.id);
    return mapServiceNowUserToInternal(user, userRef);
  } catch {
    return {
      ...userRef,
      email: userRef.email ?? null,
      userName: userRef.userName ?? null
    };
  }
}

async function safeFetchJournalEntries(
  incidentSysId: string | null
): Promise<ServiceNowJournalField[]> {
  if (!incidentSysId) return [];

  try {
    return await fetchIncidentJournalEntries(incidentSysId);
  } catch {
    return [];
  }
}

export async function listTickets(
  input: ListTicketsInput
): Promise<InternalTicket[]> {
  const incidents = await fetchIncidentsFromServiceNow({
    limit: input.limit,
    query: input.query
  });

  const tickets = await Promise.all(
    incidents.map(async (incident): Promise<InternalTicket> => {
      const baseTicket = mapIncidentBase(incident);
      const incidentSysId = getFieldValue(incident.sys_id);

      const [
        journalEntries,
        requester,
        assignee,
        caller
      ] = await Promise.all([
        safeFetchJournalEntries(incidentSysId),
        enrichUser(baseTicket.requester),
        enrichUser(baseTicket.assignee),
        enrichUser(baseTicket.caller)
      ]);

      const { comments, workNotes } = mapJournalEntries(journalEntries);

      return {
        ...baseTicket,
        requester,
        assignee,
        caller,
        comments,
        workNotes
      };
    })
  );

  return tickets;
}