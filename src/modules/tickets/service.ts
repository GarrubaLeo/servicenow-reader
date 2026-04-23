import { fetchIncidentsFromServiceNow } from '../../clients/serviceNowClient';
import { InternalTicket } from '../../models/internalTicket';
import { mapServiceNowIncidentToInternal } from './mapper';

interface ListTicketsInput {
  limit?: number;
  query?: string;
}

export async function listTickets(input: ListTicketsInput): Promise<InternalTicket[]> {
  const incidents = await fetchIncidentsFromServiceNow({
    limit: input.limit,
    query: input.query
  });

  return incidents.map(mapServiceNowIncidentToInternal);
}