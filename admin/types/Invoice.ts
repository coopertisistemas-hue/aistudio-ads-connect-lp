// Billing & Invoices Types

export enum InvoiceStatus {
    PENDING = 'pending',
    PAID = 'paid',
    OVERDUE = 'overdue',
    CANCELLED = 'cancelled',
    REFUNDED = 'refunded'
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    clientId: string;
    clientName: string;
    subscriptionId?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    dueDate: string;
    paidAt?: string;
    status: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    nfeNumber?: string;
    nfeUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface InvoiceFilters {
    clientId?: string;
    status?: InvoiceStatus;
    paymentMethod?: PaymentMethod;
    startDate?: string;
    endDate?: string;
    q?: string;
    page?: number;
    pageSize?: number;
}

export interface PaginatedInvoices {
    data: Invoice[];
    total: number;
    page: number;
    pageSize: number;
}

export interface BillingStats {
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
}
