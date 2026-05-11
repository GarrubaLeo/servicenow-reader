export interface MovideskContact {
  id?: number;

  contactType?: string;

  contact: string;

  isDefault?: boolean;
}

export interface MovideskEmail {
  id?: number;

  email: string;

  isDefault?: boolean;
}

export interface MovideskPerson {
  id?: string | number;

  businessName: string;

  personType: 1 | 2;

  profileType: 1 | 2 | 3;

  isActive?: boolean;

  accountEmail?: string | null;

  accessProfile?: string | null;

  userName?: string | null;

  corporateName?: string | null;

  businessBranch?: string | null;

  cpfCnpj?: string | null;

  role?: string | null;

  observations?: string | null;

  contacts?: MovideskContact[];

  emails?: MovideskEmail[];

  teams?: unknown[];
}

export interface MovideskTicketClient {
  id?: string | number;

  businessName?: string;
}

export interface MovideskTicketCreatedBy {
  id: string | number;
}

export interface MovideskTicketAction {
  type: 1 | 2;

  description: string;

  createdBy?: {
    id?: string | number;

    businessName?: string;
  };

  isInternal?: boolean;
}

export interface MovideskTicketPayload {
  subject: string;

  type: 1 | 2;

  serviceFirstLevel?: string;

  serviceSecondLevel?: string;

  serviceThirdLevel?: string;

  urgency?: string;

  status?: string;

  category?: string;

  ownerTeam?: string;

  createdBy: MovideskTicketCreatedBy;

  clients: MovideskTicketClient[];

  actions?: MovideskTicketAction[];
}

export interface MovideskTicketResponse {
  id: number;

  protocol: string;

  subject: string;

  status: string;
}

export interface MovideskApiError {
  message?: string;

  error?: string;
}