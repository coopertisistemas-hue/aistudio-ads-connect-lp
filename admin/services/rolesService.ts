// Simplified services for remaining modules - following established pattern

import { Role, RoleFilters, PaginatedRoles, AVAILABLE_MODULES } from '../types/Role';

const MOCK_ROLES: Role[] = [
    {
        id: 'role-1',
        name: 'Super Admin',
        description: 'Acesso total ao sistema',
        permissions: AVAILABLE_MODULES.map(module => ({
            module,
            canView: true,
            canCreate: true,
            canEdit: true,
            canDelete: true
        })),
        usersCount: 1,
        isSystem: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    },
    {
        id: 'role-2',
        name: 'Admin',
        description: 'Acesso administrativo limitado',
        permissions: AVAILABLE_MODULES.map(module => ({
            module,
            canView: true,
            canCreate: module !== 'users' && module !== 'roles',
            canEdit: module !== 'users' && module !== 'roles',
            canDelete: false
        })),
        usersCount: 1,
        isSystem: false,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
    }
];

const STORAGE_KEY = 'adsconnect:roles:v1';
const getRoles = (): Role[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ROLES));
            return MOCK_ROLES;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ROLES));
        return MOCK_ROLES;
    }
};

const saveRoles = (roles: Role[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
const generateId = () => `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const rolesService = {
    async listRoles(filters: RoleFilters): Promise<PaginatedRoles> {
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = [...getRoles()];

        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(r =>
                r.name.toLowerCase().includes(query) ||
                r.description.toLowerCase().includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async getRoleById(id: string): Promise<Role | null> {
        return getRoles().find(r => r.id === id) || null;
    },

    async createRole(payload: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
        const roles = getRoles();
        const now = new Date().toISOString();
        const newRole: Role = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
        roles.push(newRole);
        saveRoles(roles);
        return newRole;
    },

    async updateRole(id: string, changes: Partial<Omit<Role, 'id' | 'createdAt'>>): Promise<Role> {
        const roles = getRoles();
        const index = roles.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Role not found');
        roles[index] = { ...roles[index], ...changes, updatedAt: new Date().toISOString() };
        saveRoles(roles);
        return roles[index];
    },

    async deleteRole(id: string): Promise<void> {
        const roles = getRoles();
        const role = roles.find(r => r.id === id);
        if (role?.isSystem) throw new Error('Cannot delete system role');
        saveRoles(roles.filter(r => r.id !== id));
    }
};
