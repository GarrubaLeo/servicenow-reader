import { InternalTicket, InternalUserRef } from '../../models/internalTicket';
import { env } from '../../config/env';

import {
  MovideskTicketAction,
  MovideskTicketPayload
} from './types';

function getRequester(ticket: InternalTicket): InternalUserRef | null {
  return ticket.caller ?? ticket.requester ?? null;
}

function buildDescription(ticket: InternalTicket): string {
  return [
    `<b>Integração ServiceNow</b>`,
    `<br/>`,
    `<b>Incidente:</b> ${ticket.ticketNumber}`,
    `<br/>`,
    `<b>ServiceNow Sys ID:</b> ${ticket.externalId}`,
    `<br/>`,
    `<b>Status:</b> ${ticket.status.label ?? ticket.status.code ?? '-'}`,
    `<br/>`,
    `<b>Prioridade:</b> ${ticket.priority.label ?? ticket.priority.code ?? '-'}`,
    `<br/>`,
    `<br/>`,
    `<b>Descrição:</b>`,
    `<br/>`,
    ticket.description ?? '-'
  ].join('');
}

function buildJournalActions(ticket: InternalTicket): MovideskTicketAction[] {
  const commentActions: MovideskTicketAction[] = ticket.comments.map((comment) => ({
    type: 2,
    isInternal: false,
    description: [
      `<b>Comentário ServiceNow</b>`,
      `<br/>`,
      `<b>Criado por:</b> ${comment.createdBy ?? '-'}`,
      `<br/>`,
      `<b>Data:</b> ${comment.createdAt ?? '-'}`,
      `<br/><br/>`,
      comment.text
    ].join('')
  }));

  const workNoteActions: MovideskTicketAction[] = ticket.workNotes.map((note) => ({
    type: 2,
    isInternal: true,
    description: [
      `<b>Work Note ServiceNow</b>`,
      `<br/>`,
      `<b>Criado por:</b> ${note.createdBy ?? '-'}`,
      `<br/>`,
      `<b>Data:</b> ${note.createdAt ?? '-'}`,
      `<br/><br/>`,
      note.text
    ].join('')
  }));

  return [...commentActions, ...workNoteActions];
}

export function mapServiceNowTicketToMovideskPayload(
  ticket: InternalTicket,
  movideskClientId: string | number
): MovideskTicketPayload {
  const requester = getRequester(ticket);

  return {
    subject: `[${ticket.ticketNumber}] ${ticket.subject}`,

    type: 1,

    createdBy: {
      id: env.MOVIDESK_CREATED_BY_ID
    },

    clients: [
      {
        id: movideskClientId,
        businessName: requester?.name ?? undefined
      }
    ],

    // Temporariamente removido para evitar erro:
    // "There is no match for the Priority value entered"
    // Depois devemos mapear conforme os valores reais cadastrados no Movidesk.
    urgency: undefined,

    serviceFirstLevel: env.MOVIDESK_DEFAULT_SERVICE || undefined,

    category: env.MOVIDESK_DEFAULT_CATEGORY || undefined,

    ownerTeam: env.MOVIDESK_DEFAULT_OWNER_TEAM || undefined,

    actions: [
      {
        type: 2,
        isInternal: false,
        description: buildDescription(ticket)
      },
      ...buildJournalActions(ticket)
    ]
  };
}