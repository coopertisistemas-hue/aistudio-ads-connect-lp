// Support & Help Desk Types

export enum TicketPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    URGENT = 'urgent'
}

export enum TicketStatus {
    OPEN = 'open',
    IN_PROGRESS = 'in_progress',
    WAITING_CUSTOMER = 'waiting_customer',
    RESOLVED = 'resolved',
    CLOSED = 'closed'
}

export enum TicketCategory {
    TECHNICAL = 'technical',
    BILLING = 'billing',
    FEATURE_REQUEST = 'feature_request',
    BUG_REPORT = 'bug_report',
    QUESTION = 'question',
    OTHER = 'other'
}

export interface TicketMessage {
    id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    content: string;
    attachments?: string[];
    isInternal: boolean; // Internal notes not visible to customer
    createdAt: string;
}

export interface Ticket {
    id: string;
    ticketNumber: string;
    userId: string;
    userName: string;
    userEmail: string;
    subject: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    assignedToName?: string;
    messages: TicketMessage[];
    tags: string[];
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    closedAt?: string;
}

export interface TicketFilters {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    assignedTo?: string;
    userId?: string;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedTickets {
    data: Ticket[];
    total: number;
    page: number;
    pageSize: number;
}

export interface TicketStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    avgResponseTime: number; // hours
    avgResolutionTime: number; // hours
}
