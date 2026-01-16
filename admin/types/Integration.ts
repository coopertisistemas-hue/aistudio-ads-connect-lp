// API Integrations Types

export enum IntegrationType {
    API_KEY = 'api_key',
    WEBHOOK = 'webhook',
    OAUTH = 'oauth'
}

export enum IntegrationStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    ERROR = 'error'
}

export interface Integration {
    id: string;
    name: string;
    type: IntegrationType;
    service: string; // ex: "Google Ads", "Meta Ads", "Zapier"
    description?: string;
    apiKey?: string;
    webhookUrl?: string;
    oauthToken?: string;
    status: IntegrationStatus;
    lastUsedAt?: string;
    lastError?: string;
    requestsCount: number;
    requestsLimit?: number;
    createdAt: string;
    updatedAt: string;
}

export interface IntegrationFilters {
    type?: IntegrationType;
    status?: IntegrationStatus;
    service?: string;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedIntegrations {
    data: Integration[];
    total: number;
    page: number;
    pageSize: number;
}

export interface IntegrationLog {
    id: string;
    integrationId: string;
    method: string;
    endpoint: string;
    statusCode: number;
    requestBody?: string;
    responseBody?: string;
    duration: number; // ms
    createdAt: string;
}
