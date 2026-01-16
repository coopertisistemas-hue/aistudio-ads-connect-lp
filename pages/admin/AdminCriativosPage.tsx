import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Video, FileText, Upload, X, Tag, Trash2, Edit } from 'lucide-react';
import { Creative, CreativeType, CreativeStatus, CreativeFilters } from '../../admin/types/Creative';
import { creativesService } from '../../admin/services/creativesService';
import { trackEvent } from '../../lib/tracking';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminEmptyState from '../../components/admin/AdminEmptyState';
import { FilterBar, AdminModal } from '../../components/admin/AdminUI';

const AdminCriativosPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [data, setData] = useState<Creative[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedCreative, setSelectedCreative] = useState<Creative | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [newCreative, setNewCreative] = useState({
        name: '',
        type: 'image' as CreativeType,
        url: '',
        tags: [] as string[],
        tagInput: ''
    });
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const filters: CreativeFilters = {
        type: (searchParams.get('type') as CreativeType) || undefined,
        status: (searchParams.get('status') as CreativeStatus) || undefined,
        q: searchParams.get('q') || '',
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: 12
    };

    useEffect(() => {
        loadCreatives();
    }, [searchParams]);

    const loadCreatives = async () => {
        setLoading(true);
        const result = await creativesService.listCreatives(filters);
        setData(result.data);
        setTotal(result.total);
        setLoading(false);
    };

    const handleFilterChange = (key: string, value: string) => {
        const fresh = new URLSearchParams(searchParams);
        if (value) fresh.set(key, value);
        else fresh.delete(key);
        fresh.set('page', '1');
        setSearchParams(fresh);
    };

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateCreative = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCreative.name.trim()) {
            showToast('Preencha o nome do criativo.', 'error');
            return;
        }

        try {
            // Simulate file upload with placeholder
            const placeholderUrl = newCreative.type === 'image'
                ? `https://placehold.co/1200x628/0B4F4A/FFE600?text=${encodeURIComponent(newCreative.name)}`
                : newCreative.type === 'video'
                    ? 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4'
                    : '';

            await creativesService.createCreative({
                name: newCreative.name,
                type: newCreative.type,
                url: placeholderUrl,
                thumbnailUrl: newCreative.type === 'image' ? placeholderUrl : 'https://placehold.co/300x169/0B4F4A/FFE600?text=Video',
                fileSize: Math.floor(Math.random() * 1000000) + 100000,
                dimensions: newCreative.type !== 'copy' ? { width: 1200, height: 628 } : undefined,
                tags: newCreative.tags,
                usedInAds: [],
                status: 'active'
            });

            setIsModalOpen(false);
            setNewCreative({ name: '', type: 'image', url: '', tags: [], tagInput: '' });
            loadCreatives();
            trackEvent('admin_creative_create', { type: newCreative.type });
            showToast('Criativo adicionado com sucesso!');
        } catch (error) {
            showToast('Erro ao adicionar criativo.', 'error');
        }
    };

    const handleDeleteCreative = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este criativo?')) {
            await creativesService.deleteCreative(id);
            if (selectedCreative?.id === id) setSelectedCreative(null);
            loadCreatives();
            trackEvent('admin_creative_delete', { id });
            showToast('Criativo excluído com sucesso!');
        }
    };

    const handleAddTag = () => {
        if (newCreative.tagInput.trim() && !newCreative.tags.includes(newCreative.tagInput.trim())) {
            setNewCreative({
                ...newCreative,
                tags: [...newCreative.tags, newCreative.tagInput.trim()],
                tagInput: ''
            });
        }
    };

    const handleRemoveTag = (tag: string) => {
        setNewCreative({
            ...newCreative,
            tags: newCreative.tags.filter(t => t !== tag)
        });
    };

    const getTypeIcon = (type: CreativeType) => {
        switch (type) {
            case 'image': return ImageIcon;
            case 'video': return Video;
            case 'copy': return FileText;
        }
    };

    const getTypeLabel = (type: CreativeType) => {
        switch (type) {
            case 'image': return 'Imagem';
            case 'video': return 'Vídeo';
            case 'copy': return 'Copy';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Biblioteca de Criativos"
                description="Repositório central de imagens, vídeos e copies para suas campanhas."
                primaryAction={{
                    label: "Upload de Mídia",
                    onClick: () => setIsModalOpen(true)
                }}
            />

            <FilterBar>
                <input
                    type="text"
                    placeholder="Buscar por nome ou tags..."
                    value={filters.q}
                    onChange={(e) => handleFilterChange('q', e.target.value)}
                    className="filter-input"
                />
                <select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os tipos</option>
                    <option value="image">Imagem</option>
                    <option value="video">Vídeo</option>
                    <option value="copy">Copy</option>
                </select>
                <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="filter-select"
                >
                    <option value="">Todos os status</option>
                    <option value="active">Ativo</option>
                    <option value="archived">Arquivado</option>
                </select>
            </FilterBar>

            {loading ? (
                <div className="admin-card p-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-brandDark/40 font-medium">Carregando criativos...</p>
                </div>
            ) : data.length === 0 ? (
                <div className="admin-card">
                    <AdminEmptyState
                        title="Nenhum criativo encontrado"
                        description="Adicione seus primeiros assets para facilitar a criação de novos anúncios."
                        icon={ImageIcon}
                        action={{
                            label: "Adicionar Criativo",
                            onClick: () => setIsModalOpen(true)
                        }}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.map((creative) => {
                            const TypeIcon = getTypeIcon(creative.type);
                            return (
                                <div
                                    key={creative.id}
                                    className="admin-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                                    onClick={() => {
                                        setSelectedCreative(creative);
                                        setIsViewModalOpen(true);
                                    }}
                                >
                                    {/* Preview */}
                                    <div className="relative aspect-video bg-brandDark/5 flex items-center justify-center overflow-hidden">
                                        {creative.type === 'copy' ? (
                                            <div className="p-6 text-center">
                                                <FileText className="w-12 h-12 text-brandDark/30 mx-auto mb-3" />
                                                <p className="text-sm text-brandDark/60 font-medium">Copy Text</p>
                                            </div>
                                        ) : (
                                            <img
                                                src={creative.thumbnailUrl || creative.url}
                                                alt={creative.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            />
                                        )}
                                        <div className="absolute top-2 right-2">
                                            <AdminStatusBadge status={creative.status} />
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-start gap-2 mb-2">
                                            <TypeIcon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                            <h3 className="font-bold text-brandDark text-sm line-clamp-2">{creative.name}</h3>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-brandDark/40 mb-3">
                                            <span>{getTypeLabel(creative.type)}</span>
                                            <span>•</span>
                                            <span>{formatFileSize(creative.fileSize)}</span>
                                            {creative.dimensions && (
                                                <>
                                                    <span>•</span>
                                                    <span>{creative.dimensions.width}x{creative.dimensions.height}</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Tags */}
                                        {creative.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {creative.tags.slice(0, 3).map((tag, i) => (
                                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                                                        <Tag className="w-2.5 h-2.5" />
                                                        {tag}
                                                    </span>
                                                ))}
                                                {creative.tags.length > 3 && (
                                                    <span className="text-[10px] text-brandDark/40 font-bold">+{creative.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Usage */}
                                        <p className="text-xs text-brandDark/40">
                                            Usado em <span className="font-bold text-brandDark/60">{creative.usedInAds.length}</span> anúncio{creative.usedInAds.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {total > filters.pageSize && (
                        <div className="flex justify-center gap-2 mt-8">
                            {Array.from({ length: Math.ceil(total / filters.pageSize) }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => handleFilterChange('page', page.toString())}
                                    className={`px-4 py-2 rounded font-bold text-sm transition-colors ${page === filters.page
                                        ? 'bg-primary text-white'
                                        : 'bg-white text-brandDark/60 hover:bg-brandDark/5'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Create Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Adicionar Criativo"
            >
                <form onSubmit={handleCreateCreative} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Nome *</label>
                        <input
                            type="text"
                            value={newCreative.name}
                            onChange={(e) => setNewCreative({ ...newCreative, name: e.target.value })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Ex: Banner Promo Verão 2026"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Tipo *</label>
                        <select
                            value={newCreative.type}
                            onChange={(e) => setNewCreative({ ...newCreative, type: e.target.value as CreativeType })}
                            className="w-full px-4 py-3 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="image">Imagem</option>
                            <option value="video">Vídeo</option>
                            <option value="copy">Copy</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-brandDark mb-2">Tags</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newCreative.tagInput}
                                onChange={(e) => setNewCreative({ ...newCreative, tagInput: e.target.value })}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                className="flex-1 px-4 py-2 border border-brandDark/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                placeholder="Digite uma tag e pressione Enter"
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="px-4 py-2 bg-brandDark/5 text-brandDark rounded-lg hover:bg-brandDark/10 transition-colors text-sm font-bold"
                            >
                                Adicionar
                            </button>
                        </div>
                        {newCreative.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {newCreative.tags.map((tag, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded">
                                        {tag}
                                        <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-primary/70">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 px-6 py-3 border border-brandDark/10 text-brandDark rounded-lg hover:bg-brandDark/5 transition-colors font-bold"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold"
                        >
                            Adicionar
                        </button>
                    </div>
                </form>
            </AdminModal>

            {/* View/Details Modal */}
            {selectedCreative && (
                <AdminModal
                    isOpen={isViewModalOpen}
                    onClose={() => {
                        setIsViewModalOpen(false);
                        setSelectedCreative(null);
                    }}
                    title={selectedCreative.name}
                >
                    <div className="space-y-6">
                        {/* Preview */}
                        <div className="relative aspect-video bg-brandDark/5 rounded-lg overflow-hidden">
                            {selectedCreative.type === 'copy' ? (
                                <div className="p-8 text-center flex items-center justify-center h-full">
                                    <div>
                                        <FileText className="w-16 h-16 text-brandDark/30 mx-auto mb-4" />
                                        <p className="text-brandDark/60 font-medium">Copy Text</p>
                                    </div>
                                </div>
                            ) : (
                                <img
                                    src={selectedCreative.url}
                                    alt={selectedCreative.name}
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Tipo</p>
                                <p className="text-brandDark font-bold">{getTypeLabel(selectedCreative.type)}</p>
                            </div>
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Tamanho</p>
                                <p className="text-brandDark font-bold">{formatFileSize(selectedCreative.fileSize)}</p>
                            </div>
                            {selectedCreative.dimensions && (
                                <div>
                                    <p className="text-brandDark/40 font-medium mb-1">Dimensões</p>
                                    <p className="text-brandDark font-bold">{selectedCreative.dimensions.width} x {selectedCreative.dimensions.height}px</p>
                                </div>
                            )}
                            <div>
                                <p className="text-brandDark/40 font-medium mb-1">Status</p>
                                <AdminStatusBadge status={selectedCreative.status} />
                            </div>
                        </div>

                        {/* Tags */}
                        {selectedCreative.tags.length > 0 && (
                            <div>
                                <p className="text-brandDark/40 font-medium mb-2 text-sm">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCreative.tags.map((tag, i) => (
                                        <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded">
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Usage */}
                        <div>
                            <p className="text-brandDark/40 font-medium mb-2 text-sm">Uso em Campanhas</p>
                            <p className="text-brandDark font-bold">
                                {selectedCreative.usedInAds.length === 0
                                    ? 'Não está sendo usado em nenhuma campanha'
                                    : `Usado em ${selectedCreative.usedInAds.length} campanha${selectedCreative.usedInAds.length !== 1 ? 's' : ''}`
                                }
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 border-t border-brandDark/10">
                            <button
                                onClick={() => handleDeleteCreative(selectedCreative.id)}
                                className="flex-1 px-6 py-3 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-bold flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-bold"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </AdminModal>
            )}

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-lg shadow-lg font-bold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } animate-fade-in`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default AdminCriativosPage;
