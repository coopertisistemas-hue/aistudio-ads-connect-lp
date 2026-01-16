// Role & Permissions Types

export interface Permission {
    module: string;
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    usersCount: number;
    isSystem: boolean; // System roles cannot be deleted
    createdAt: string;
    updatedAt: string;
}

export interface RoleFilters {
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedRoles {
    data: Role[];
    total: number;
    page: number;
    pageSize: number;
}

// Available modules for permission management
export const AVAILABLE_MODULES = [
    'dashboard',
    'leads',
    'sites',
    'ads',
    'reports',
    'creatives',
    'inventory',
    'slots',
    'insights',
    'marketing',
    'clients',
    'contracts',
    'plans',
    'subscriptions',
    'billing',
    'users',
    'roles',
    'integrations',
    'audit',
    'support',
    'settings'
] as const;
