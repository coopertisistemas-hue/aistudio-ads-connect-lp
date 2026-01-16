// User Management Types

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    PENDING = 'pending',
    SUSPENDED = 'suspended'
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    roleId: string;
    roleName: string;
    status: UserStatus;
    lastLoginAt?: string;
    lastLoginIp?: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserFilters {
    roleId?: string;
    status?: UserStatus;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedUsers {
    data: User[];
    total: number;
    page: number;
    pageSize: number;
}
