import {
  createPerson,
  createTicket,
  findPersonByEmail
} from '../../clients/movideskClient';

import {
  MovideskPerson,
  MovideskTicketPayload,
  MovideskTicketResponse
} from './types';

interface CreateTestTicketInput {
  email: string;
  businessName?: string;
  subject?: string;
}

export async function getMovideskPersonByEmail(
  email: string
): Promise<MovideskPerson | null> {
  return findPersonByEmail(email);
}

export async function createMovideskPerson(
  payload: MovideskPerson
): Promise<MovideskPerson> {
  return createPerson(payload);
}

export async function createMovideskTestTicket(
  input: CreateTestTicketInput
): Promise<MovideskTicketResponse> {
  const person =
    (await findPersonByEmail(input.email)) ??
    (await createPerson({
      businessName: input.businessName ?? input.email,
      personType: 1,
      profileType: 1,
      isActive: true,
      emails: [
        {
          email: input.email,
          isDefault: true
        }
      ]
    }));

  if (!person?.id) {
    throw new Error('Pessoa Movidesk encontrada/criada sem ID');
  }

  const payload: MovideskTicketPayload = {
    subject:
      input.subject ?? 'Teste integração ServiceNow x Movidesk',

    type: 1,

    createdBy: {
      id: person.id
    },

    clients: [
      {
        id: person.id,
        businessName: person.businessName
      }
    ],

    actions: [
      {
        type: 2,
        description:
          'Ticket criado via API de integração para validação técnica.'
      }
    ]
  };

  return createTicket(payload);
}