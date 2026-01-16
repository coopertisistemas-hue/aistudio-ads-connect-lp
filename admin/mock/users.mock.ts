import { User } from '../types/User';

export const MOCK_USERS: User[] = [
    {
        id: 'user-1',
        name: 'Jose Alexandre',
        email: 'jose@adsconnect.com',
        avatar: 'https://ui-avatars.com/api/?name=Jose+Alexandre&background=0B4F4A&color=FFE600',
        roleId: 'role-1',
        roleName: 'Super Admin',
        status: 'active',
        lastLoginAt: '2026-01-16T09:00:00Z',
        lastLoginIp: '192.168.1.100',
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-01-16T09:00:00Z'
    },
    {
        id: 'user-2',
        name: 'Ana Silva',
        email: 'ana@adsconnect.com',
        roleId: 'role-2',
        roleName: 'Admin',
        status: 'active',
        lastLoginAt: '2026-01-15T14:30:00Z',
        emailVerified: true,
        twoFactorEnabled: false,
        createdAt: '2025-03-15T00:00:00Z',
        updatedAt: '2026-01-15T14:30:00Z'
    }
];
