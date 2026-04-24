export interface ServiceNowValueDisplay {
  value: string | null;
  display_value?: string | null;
  link?: string;
}

export type ServiceNowField = string | ServiceNowValueDisplay | null;

export interface ServiceNowIncident {
  sys_id: ServiceNowField;
  number: ServiceNowField;
  short_description: ServiceNowField;
  description?: ServiceNowField;

  state?: ServiceNowField;
  priority?: ServiceNowField;

  opened_by?: ServiceNowField;
  assigned_to?: ServiceNowField;
  caller_id?: ServiceNowField;

  sys_created_on?: ServiceNowField;
  sys_updated_on?: ServiceNowField;
}

export interface ServiceNowJournalField {
  sys_id: string;
  element?: string | null;
  element_id?: string | null;
  value?: string | null;
  sys_created_on?: string | null;
  sys_created_by?: string | null;
}

export interface ServiceNowUser {
  sys_id: string;
  name?: string | null;
  email?: string | null;
  user_name?: string | null;
  active?: string | boolean | null;
}

export interface ServiceNowTableResponse<T> {
  result: T[];
}