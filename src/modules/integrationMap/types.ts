export type SourceSystem = 'servicenow';
export type TargetSystem = 'movidesk';

export type IntegrationMapStatus = 'SENT' | 'ERROR' | 'PENDING';

export interface IntegrationTicketMap {
  id: string;

  sourceSystem: SourceSystem;
  sourceTicketId: string;
  sourceTicketNumber: string;

  targetSystem: TargetSystem;
  targetTicketId: string | number;
  targetProtocol: string;

  status: IntegrationMapStatus;

  createdAt: string;
  updatedAt: string;

  lastError?: string | null;
}