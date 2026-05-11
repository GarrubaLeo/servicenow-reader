import {
  fetchIncidentJournalEntries,
  fetchIncidentsFromServiceNow,
  fetchUserBySysId
} from '../../clients/serviceNowClient';

import {
  createPerson,
  createTicket,
  findPersonByEmail
} from '../../clients/movideskClient';

import { InternalTicket, InternalUserRef } from '../../models/internalTicket';

import {
  getFieldValue,
  mapIncidentBase,
  mapJournalEntries,
  mapServiceNowUserToInternal
} from './mapper';

import {
  ServiceNowIncident,
  ServiceNowJournalField
} from './types';

import { mapServiceNowTicketToMovideskPayload } from '../movidesk/mapper';

import {
  createIntegrationMap,
  findBySourceTicket
} from '../integrationMap/repository';

interface ListTicketsInput {
  limit?: number;
  query?: string;
}

interface SendTicketToMovideskInput {
  sysId?: string;
  number?: string;
}

async function enrichUser(
  userRef: InternalUserRef | null
): Promise<InternalUserRef | null> {
  if (!userRef?.id) {
    return userRef;
  }

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
  if (!incidentSysId) {
    return [];
  }

  try {
    return await fetchIncidentJournalEntries(incidentSysId);
  } catch {
    return [];
  }
}

async function buildInternalTicket(
  incident: ServiceNowIncident
): Promise<InternalTicket> {
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

  const { comments, workNotes } =
    mapJournalEntries(journalEntries);

  return {
    ...baseTicket,
    requester,
    assignee,
    caller,
    comments,
    workNotes
  };
}

export async function listTickets(
  input: ListTicketsInput
): Promise<InternalTicket[]> {
  const incidents = await fetchIncidentsFromServiceNow({
    limit: input.limit,
    query: input.query
  });

  return Promise.all(
    incidents.map(buildInternalTicket)
  );
}

function getRequesterForMovidesk(
  ticket: InternalTicket
): InternalUserRef | null {
  return ticket.caller ?? ticket.requester ?? null;
}

export async function sendTicketToMovidesk(
  input: SendTicketToMovideskInput
) {
  if (!input.sysId && !input.number) {
    throw new Error(
      'Informe sysId ou number para envio ao Movidesk'
    );
  }

  const query = input.sysId
    ? `sys_id=${input.sysId}`
    : `number=${input.number}`;

  const incidents = await fetchIncidentsFromServiceNow({
    limit: 1,
    query
  });

  const incident = incidents[0];

  if (!incident) {
    throw new Error(
      'Incident não encontrado no ServiceNow'
    );
  }

  const ticket = await buildInternalTicket(incident);

  const existingMap = findBySourceTicket(
    ticket.externalId,
    ticket.ticketNumber
  );

  if (existingMap) {
    return {
      duplicated: true,
      message:
        'Ticket já enviado anteriormente para o Movidesk',

      source: {
        system: existingMap.sourceSystem,
        sysId: existingMap.sourceTicketId,
        number: existingMap.sourceTicketNumber
      },

      target: {
        system: existingMap.targetSystem,
        id: existingMap.targetTicketId,
        protocol: existingMap.targetProtocol
      },

      map: existingMap
    };
  }

  const requester =
    getRequesterForMovidesk(ticket);

  const requesterEmail =
    requester?.email;

  if (!requesterEmail) {
    throw new Error(
      `Ticket ${ticket.ticketNumber} sem e-mail de caller/requester para localizar pessoa no Movidesk`
    );
  }

  const person =
    (await findPersonByEmail(requesterEmail)) ??
    (await createPerson({
      businessName:
        requester?.name ??
        requesterEmail,

      personType: 1,

      profileType: 1,

      isActive: true,

      emails: [
        {
          email: requesterEmail,
          isDefault: true
        }
      ]
    }));

  if (!person?.id) {
    throw new Error(
      'Pessoa Movidesk encontrada/criada sem ID'
    );
  }

  const payload =
    mapServiceNowTicketToMovideskPayload(
      ticket,
      person.id
    );

  const movideskTicket =
    await createTicket(payload);

  const integrationMap =
    createIntegrationMap({
      sourceSystem: 'servicenow',

      sourceTicketId: ticket.externalId,

      sourceTicketNumber:
        ticket.ticketNumber,

      targetSystem: 'movidesk',

      targetTicketId:
        movideskTicket.id,

      targetProtocol:
        movideskTicket.protocol,

      status: 'SENT',

      lastError: null
    });

  return {
    duplicated: false,

    message:
      'Ticket enviado para o Movidesk com sucesso',

    source: {
      system: 'servicenow',
      sysId: ticket.externalId,
      number: ticket.ticketNumber
    },

    target: {
      system: 'movidesk',
      id: movideskTicket.id,
      protocol: movideskTicket.protocol
    },

    requester: {
      id: person.id,
      name: person.businessName,
      email: requesterEmail
    },

    map: integrationMap
  };
}