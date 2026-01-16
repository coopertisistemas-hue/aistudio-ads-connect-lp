// Audit Log Types

export enum AuditAction {
    // CRUD operations
    CREATE = 'create',
    UPDATE = 'update',
    DELETE = 'delete',
    VIEW = 'view',

    // Auth operations
    LOGIN = 'login',
    LOGOUT = 'logout',
    LOGIN_FAILED = 'login_failed',

    // Special operations
    EXPORT = 'export',
    IMPORT = 'import',
    RESTORE = 'restore',
    ARCHIVE = 'archive'
}

export interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    action: AuditAction;
    module: string;
    entityType?: string; // ex: "lead", "ad", "site"
    entityId?: string;
    entityName?: string;
    details: Record<string, any>;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

export interface AuditFilters {
    userId?: string;
    action?: AuditAction;
    module?: string;
    entityType?: string;
    startDate?: string;
    endDate?: string;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedAuditLogs {
    data: AuditLog[];
    total: number;
    page: number;
    pageSize: number;
}
