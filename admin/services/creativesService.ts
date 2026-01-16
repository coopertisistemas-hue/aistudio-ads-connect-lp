// Hybrid service: Supabase + localStorage fallback
import { Creative, CreativeFilters, PaginatedCreatives } from '../types/Creative';
import { MOCK_CREATIVES } from '../mock/creatives.mock';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const STORAGE_KEY = 'adsconnect:creatives:v1';
const USE_SUPABASE = isSupabaseConfigured();

// ============================================================================
// localStorage Implementation (Fallback)
// ============================================================================

const getCreativesLocal = (): Creative[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CREATIVES));
            return MOCK_CREATIVES;
        }
        const parsed = JSON.parse(stored);
        if (!Array.isArray(parsed)) throw new Error('Invalid data format');
        return parsed;
    } catch (error) {
        console.error('Failed to parse creatives from storage:', error);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_CREATIVES));
        return MOCK_CREATIVES;
    }
};

const saveCreativesLocal = (creatives: Creative[]) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(creatives));
    } catch (error) {
        console.error('Failed to save creatives:', error);
    }
};

// ============================================================================
// Supabase Implementation
// ============================================================================

const listCreativesSupabase = async (filters: CreativeFilters): Promise<PaginatedCreatives> => {
    let query = supabase
        .from('creatives')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

    if (filters.type) {
        query = query.eq('type', filters.type);
    }

    if (filters.status) {
        query = query.eq('status', filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags);
    }

    if (filters.q) {
        query = query.or(`name.ilike.%${filters.q}%,tags.cs.{${filters.q}}`);
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 12;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
        data: data || [],
        total: count || 0,
        page,
        pageSize
    };
};

const getCreativeByIdSupabase = async (id: string): Promise<Creative | null> => {
    const { data, error } = await supabase
        .from('creatives')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
    }

    return data;
};

const createCreativeSupabase = async (payload: Omit<Creative, 'id' | 'createdAt' | 'updatedAt'>): Promise<Creative> => {
    const { data, error } = await supabase
        .from('creatives')
        .insert([payload])
        .select()
        .single();

    if (error) throw error;

    return data;
};

const updateCreativeSupabase = async (id: string, changes: Partial<Omit<Creative, 'id' | 'createdAt'>>): Promise<Creative> => {
    const { data, error } = await supabase
        .from('creatives')
        .update(changes)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    return data;
};

const deleteCreativeSupabase = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('creatives')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

// ============================================================================
// localStorage Implementation (for fallback)
// ============================================================================

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `creative-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const listCreativesLocal = async (filters: CreativeFilters): Promise<PaginatedCreatives> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const allCreatives = getCreativesLocal();
    allCreatives.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    let filtered = [...allCreatives];

    if (filters.type) {
        filtered = filtered.filter(c => c.type === filters.type);
    }

    if (filters.status) {
        filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(c =>
            filters.tags!.some(tag => c.tags.includes(tag))
        );
    }

    if (filters.q) {
        const query = filters.q.toLowerCase();
        filtered = filtered.filter(c =>
            c.name.toLowerCase().includes(query) ||
            c.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }

    const total = filtered.length;
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 12;
    const data = filtered.slice((page - 1) * pageSize, page * pageSize);

    return { data, total, page, pageSize };
};

const getCreativeByIdLocal = async (id: string): Promise<Creative | null> => {
    const creatives = getCreativesLocal();
    return creatives.find(c => c.id === id) || null;
};

const createCreativeLocal = async (payload: Omit<Creative, 'id' | 'createdAt' | 'updatedAt'>): Promise<Creative> => {
    const creatives = getCreativesLocal();
    const now = new Date().toISOString();
    const newCreative: Creative = {
        ...payload,
        id: generateId(),
        createdAt: now,
        updatedAt: now
    };
    creatives.push(newCreative);
    saveCreativesLocal(creatives);
    return newCreative;
};

const updateCreativeLocal = async (id: string, changes: Partial<Omit<Creative, 'id' | 'createdAt'>>): Promise<Creative> => {
    const creatives = getCreativesLocal();
    const index = creatives.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Creative not found');

    creatives[index] = {
        ...creatives[index],
        ...changes,
        updatedAt: new Date().toISOString()
    };
    saveCreativesLocal(creatives);
    return creatives[index];
};

const deleteCreativeLocal = async (id: string): Promise<void> => {
    const creatives = getCreativesLocal();
    const filtered = creatives.filter(c => c.id !== id);
    saveCreativesLocal(filtered);
};

// ============================================================================
// Exported Service (Auto-selects Supabase or localStorage)
// ============================================================================

export const creativesService = {
    async listCreatives(filters: CreativeFilters): Promise<PaginatedCreatives> {
        if (USE_SUPABASE) {
            return listCreativesSupabase(filters);
        }
        return listCreativesLocal(filters);
    },

    async getCreativeById(id: string): Promise<Creative | null> {
        if (USE_SUPABASE) {
            return getCreativeByIdSupabase(id);
        }
        return getCreativeByIdLocal(id);
    },

    async createCreative(payload: Omit<Creative, 'id' | 'createdAt' | 'updatedAt'>): Promise<Creative> {
        if (USE_SUPABASE) {
            return createCreativeSupabase(payload);
        }
        return createCreativeLocal(payload);
    },

    async updateCreative(id: string, changes: Partial<Omit<Creative, 'id' | 'createdAt'>>): Promise<Creative> {
        if (USE_SUPABASE) {
            return updateCreativeSupabase(id, changes);
        }
        return updateCreativeLocal(id, changes);
    },

    async deleteCreative(id: string): Promise<void> {
        if (USE_SUPABASE) {
            return deleteCreativeSupabase(id);
        }
        return deleteCreativeLocal(id);
    }
};

// Log which backend is being used
console.log(`[creativesService] Using ${USE_SUPABASE ? 'Supabase' : 'localStorage'} backend`);
