export interface ServiceNowReferenceField {
  value: string;
  link?: string;
}

export interface ServiceNowIncident {
  sys_id: string;
  number: string;
  short_description: string;
  description?: string | null;
  state?: string | null;
  priority?: string | null;
  opened_by?: ServiceNowReferenceField | string | null;
  assigned_to?: ServiceNowReferenceField | string | null;
  sys_created_on?: string | null;
  sys_updated_on?: string | null;
}

export interface ServiceNowTableResponse<T> {
  result: T[];
}