import { User, UserFilters, PaginatedUsers } from '../types/User';
import { MOCK_USERS } from '../mock/users.mock';

const STORAGE_KEY = 'adsconnect:users:v1';
const getUsers = (): User[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
            return MOCK_USERS;
        }
        return JSON.parse(stored);
    } catch (error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USERS));
        return MOCK_USERS;
    }
};

const saveUsers = (users: User[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
const generateId = () => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const usersService = {
    async listUsers(filters: UserFilters): Promise<PaginatedUsers> {
        await new Promise(resolve => setTimeout(resolve, 300));
        let filtered = [...getUsers()];

        if (filters.roleId) filtered = filtered.filter(u => u.roleId === filters.roleId);
        if (filters.status) filtered = filtered.filter(u => u.status === filters.status);
        if (filters.q) {
            const query = filters.q.toLowerCase();
            filtered = filtered.filter(u =>
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query)
            );
        }

        const total = filtered.length;
        const page = filters.page || 1;
        const pageSize = filters.pageSize || 10;
        const data = filtered.slice((page - 1) * pageSize, page * pageSize);

        return { data, total, page, pageSize };
    },

    async getUserById(id: string): Promise<User | null> {
        return getUsers().find(u => u.id === id) || null;
    },

    async createUser(payload: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const users = getUsers();
        const now = new Date().toISOString();
        const newUser: User = { ...payload, id: generateId(), createdAt: now, updatedAt: now };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    },

    async updateUser(id: string, changes: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) throw new Error('User not found');
        users[index] = { ...users[index], ...changes, updatedAt: new Date().toISOString() };
        saveUsers(users);
        return users[index];
    },

    async deleteUser(id: string): Promise<void> {
        saveUsers(getUsers().filter(u => u.id !== id));
    }
};
