import { httpClient } from '../shared/http/httpClient';
import { env } from '../config/env';
import { AppError } from '../shared/errors/appError';

import {
  MovideskPerson,
  MovideskTicketPayload,
  MovideskTicketResponse
} from '../modules/movidesk/types';

function buildUrl(path: string): string {
  return `${env.MOVIDESK_BASE_URL}${path}`;
}

function buildParams(params?: Record<string, unknown>) {
  return {
    token: env.MOVIDESK_TOKEN,
    ...(params ?? {})
  };
}

export async function findPersonByEmail(
  email: string
): Promise<MovideskPerson | null> {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await httpClient.get<MovideskPerson[]>(
      buildUrl('/persons'),
      {
        params: buildParams({
          q: email,
          $expand: 'contacts,emails'
        })
      }
    );

    const persons = response.data ?? [];

    const person = persons.find((p) => {
      const contactsMatch =
        p.contacts?.some((c) =>
          c.contact?.trim().toLowerCase() === normalizedEmail
        ) ?? false;

      const emailsMatch =
        p.emails?.some((e) =>
          e.email?.trim().toLowerCase() === normalizedEmail
        ) ?? false;

      const accountEmailMatch =
        p.accountEmail?.trim().toLowerCase() === normalizedEmail;

      return contactsMatch || emailsMatch || accountEmailMatch;
    });

    return person ?? null;
  } catch (error: any) {
    throw new AppError(
      `Erro ao consultar pessoa no Movidesk (${email})`,
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}

export async function createPerson(
  payload: MovideskPerson
): Promise<MovideskPerson> {
  try {
    const response = await httpClient.post<MovideskPerson>(
      buildUrl('/persons'),
      payload,
      {
        params: buildParams()
      }
    );

    return response.data;
  } catch (error: any) {
    throw new AppError(
      'Erro ao criar pessoa no Movidesk',
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}

export async function getTicketById(
  ticketId: number
): Promise<MovideskTicketResponse | null> {
  try {
    const response = await httpClient.get<MovideskTicketResponse>(
      buildUrl(`/tickets/${ticketId}`),
      {
        params: buildParams()
      }
    );

    return response.data ?? null;
  } catch (error: any) {
    throw new AppError(
      `Erro ao consultar ticket Movidesk (${ticketId})`,
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}

export async function createTicket(
  payload: MovideskTicketPayload
): Promise<MovideskTicketResponse> {
  try {
    const response = await httpClient.post<MovideskTicketResponse>(
      buildUrl('/tickets'),
      payload,
      {
        params: buildParams()
      }
    );

    return response.data;
  } catch (error: any) {
    throw new AppError(
      'Erro ao criar ticket no Movidesk',
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}