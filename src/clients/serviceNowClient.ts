import { httpClient } from '../shared/http/httpClient';
import { env } from '../config/env';
import { AppError } from '../shared/errors/appError';
import { ServiceNowIncident, ServiceNowTableResponse } from '../modules/tickets/types';

interface FetchIncidentsParams {
  limit?: number;
  query?: string;
}

export async function fetchIncidentsFromServiceNow(
  params: FetchIncidentsParams = {}
): Promise<ServiceNowIncident[]> {
  const limit = params.limit ?? env.SN_DEFAULT_LIMIT;

  try {
    const response = await httpClient.get<ServiceNowTableResponse<ServiceNowIncident>>(
      `${env.SN_BASE_URL}/api/now/table/${env.SN_TABLE}`,
      {
        auth: {
          username: env.SN_USERNAME,
          password: env.SN_PASSWORD
        },
        params: {
          sysparm_limit: limit,
          sysparm_query: params.query,
          sysparm_fields: [
            'sys_id',
            'number',
            'short_description',
            'description',
            'state',
            'priority',
            'opened_by',
            'assigned_to',
            'sys_created_on',
            'sys_updated_on'
          ].join(',')
        }
      }
    );

    return response.data.result;
  } catch (error: any) {
    throw new AppError(
      'Erro ao consultar tickets no ServiceNow',
      error?.response?.status ?? 500,
      error?.response?.data ?? error?.message
    );
  }
}