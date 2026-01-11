import React from 'react';

interface AdminStatusBadgeProps {
    status: string;
    variant?: 'primary' | 'secondary' | 'neutral';
}

const AdminStatusBadge: React.FC<AdminStatusBadgeProps> = ({ status, variant }) => {
    // Normalize status for class mapping
    const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');

    return (
        <span className={`status-badge status-${normalizedStatus}`}>
            {status.replace(/_/g, ' ')}
        </span>
    );
};

export default AdminStatusBadge;
