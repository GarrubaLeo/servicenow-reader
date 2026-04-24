import { httpClient } from '../shared/http/httpClient';
import { env } from '../config/env';
import { AppError } from '../shared/errors/appError';
import {
  ServiceNowIncident,
  ServiceNowJournalField,
  ServiceNowTableResponse
} from '../modules/tickets/types';

interface FetchIncidentsParams {
  limit?: number;
  query?: string;
}

function buildAuth() {
  return {
    username: env.SN_USERNAME,
    password: env.SN_PASSWORD
  };
}

export async function fetchIncidentsFromServiceNow(
  params: FetchIncidentsParams = {}
): Promise<ServiceNowIncident[]> {
  const limit = params.limit ?? env.SN_DEFAULT_LIMIT;

  try {
    const response = await httpClient.get<ServiceNowTableResponse<ServiceNowIncident>>(
      `${env.SN_BASE_URL}/api/now/table/${env.SN_TABLE}`,
      {
        auth: buildAuth(),
        params: {
          sysparm_limit: limit,
          sysparm_query: params.query,
          sysparm_display_value: 'all',
          sysparm_exclude_reference_link: false,
          sysparm_fields: [
            'sys_id',
            'number',
            'short_description',
            'description',
            'state',
            'priority',
            'opened_by',
            'assigned_to',
            'caller_id',
            'sys_created_on',
            'sys_updated_on'
          ].join(',')
        }
      }
    );

    return response.data.result ?? [];
  } catch (error: any) {
    throw new AppError(
      'Erro ao consultar incidents no ServiceNow',
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}

export async function fetchIncidentJournalEntries(
  incidentSysId: string
): Promise<ServiceNowJournalField[]> {
  try {
    const response = await httpClient.get<ServiceNowTableResponse<ServiceNowJournalField>>(
      `${env.SN_BASE_URL}/api/now/table/sys_journal_field`,
      {
        auth: buildAuth(),
        params: {
          sysparm_query: `element_id=${incidentSysId}^ORDERBYsys_created_on`,
          sysparm_limit: 200,
          sysparm_fields: [
            'sys_id',
            'element',
            'element_id',
            'value',
            'sys_created_on',
            'sys_created_by'
          ].join(',')
        }
      }
    );

    return response.data.result ?? [];
  } catch (error: any) {
    throw new AppError(
      `Erro ao consultar comments/work notes do incident ${incidentSysId}`,
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}