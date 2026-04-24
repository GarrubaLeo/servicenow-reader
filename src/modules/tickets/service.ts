import {
  fetchIncidentJournalEntries,
  fetchIncidentsFromServiceNow
} from '../../clients/serviceNowClient';

import { InternalTicket } from '../../models/internalTicket';
import { getFieldValue, mapIncidentBase, mapJournalEntries } from './mapper';

interface ListTicketsInput {
  limit?: number;
  query?: string;
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

      if (!incidentSysId) {
        return {
          ...baseTicket,
          comments: [],
          workNotes: []
        };
      }

      const journalEntries = await fetchIncidentJournalEntries(incidentSysId);
      const { comments, workNotes } = mapJournalEntries(journalEntries);

      return {
        ...baseTicket,
        comments,
        workNotes
      };
    })
  );

  return tickets;
}