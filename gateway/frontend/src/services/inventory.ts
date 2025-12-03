import { api } from './api';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category?: string;
    unit: string;
    currentStock: number;
    minStock: number;
    maxStock?: number;
    reorderPoint?: number;
    optimalOrderQuantity?: number;
    preferredSupplierId?: string;
    preferredSupplier?: Supplier;
    unitCost?: number;
    location?: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface StockMovement {
    id: string;
    productId: string;
    product?: Product;
    type: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason?: string;
    reference?: string;
    notes?: string;
    userId: string;
    user?: {
        name: string;
        email: string;
    };
    createdAt: string;
}

export interface StockAlert {
    id: string;
    productId: string;
    product?: Product;
    type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK';
    message: string;
    currentStock: number;
    minStock: number;
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
    createdAt: string;
}

export interface Supplier {
    id: string;
    name: string;
    contactName?: string;
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    rating?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ReorderAlert {
    id: string;
    productId: string;
    product?: Product;
    currentStock: number;
    reorderPoint: number;
    suggestedQuantity: number;
    status: 'PENDING' | 'ORDERED' | 'RESOLVED' | 'IGNORED';
    purchaseOrderId?: string;
    purchaseOrder?: PurchaseOrder;
    createdAt: string;
    resolvedAt?: string;
    notes?: string;
}

export interface PurchaseOrder {
    id: string;
    orderNumber: string;
    supplierId: string;
    supplier?: Supplier;
    status: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
    orderDate: string;
    expectedDate?: string;
    receivedDate?: string;
    items: PurchaseOrderItem[];
    totalAmount?: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PurchaseOrderItem {
    id: string;
    purchaseOrderId: string;
    productId: string;
    product?: Product;
    quantity: number;
    unitCost: number;
    subtotal: number;
    receivedQty: number;
    createdAt: string;
    updatedAt: string;
}

export const inventoryService = {
    // Proveedores
    async getSuppliers(): Promise<Supplier[]> {
        const response = await api.get('/activos/vendors');
        return response.data;
    },

    // Productos
    async getProducts(includeInactive = false): Promise<Product[]> {
        const response = await api.get(`/inventory/products?includeInactive=${includeInactive}`);
        return response.data;
    },

    async searchProducts(query: string): Promise<Product[]> {
        const response = await api.get(`/inventory/products/search?q=${encodeURIComponent(query)}`);
        return response.data;
    },

    async getProduct(id: string): Promise<Product> {
        const response = await api.get(`/inventory/products/${id}`);
        return response.data;
    },

    async createProduct(data: Partial<Product>): Promise<Product> {
        const response = await api.post('/inventory/products', data);
        return response.data;
    },

    async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
        const response = await api.put(`/inventory/products/${id}`, data);
        return response.data;
    },

    async deleteProduct(id: string): Promise<Product> {
        const response = await api.delete(`/inventory/products/${id}`);
        return response.data;
    },

    async getLowStock(): Promise<Product[]> {
        const response = await api.get('/inventory/products/low-stock');
        return response.data;
    },

    async getOutOfStock(): Promise<Product[]> {
        const response = await api.get('/inventory/products/out-of-stock');
        return response.data;
    },

    // Movimientos
    async registerMovement(data: {
        productId: string;
        type: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
        quantity: number;
        reason?: string;
        reference?: string;
        notes?: string;
    }): Promise<StockMovement> {
        const response = await api.post('/inventory/products/movement', data);
        return response.data;
    },

    // Alertas de reabastecimiento
    async getReorderAlerts(status?: 'PENDING' | 'ORDERED' | 'RESOLVED' | 'IGNORED'): Promise<ReorderAlert[]> {
        const url = status ? `/inventory/reorder-alerts?status=${status}` : '/inventory/reorder-alerts';
        const response = await api.get(url);
        return response.data;
    },

    async getPendingReorderAlerts(): Promise<ReorderAlert[]> {
        const response = await api.get('/inventory/reorder-alerts/pending');
        return response.data;
    },

    async getReorderAlert(id: string): Promise<ReorderAlert> {
        const response = await api.get(`/inventory/reorder-alerts/${id}`);
        return response.data;
    },

    async createReorderAlert(productId: string): Promise<ReorderAlert> {
        const response = await api.post('/inventory/reorder-alerts', { productId });
        return response.data;
    },

    async resolveReorderAlert(id: string): Promise<ReorderAlert> {
        const response = await api.put(`/inventory/reorder-alerts/${id}/resolve`);
        return response.data;
    },

    async ignoreReorderAlert(id: string, notes?: string): Promise<ReorderAlert> {
        const response = await api.put(`/inventory/reorder-alerts/${id}/ignore`, { notes });
        return response.data;
    },

    // Órdenes de compra
    async getPurchaseOrders(filters?: {
        status?: 'DRAFT' | 'SENT' | 'RECEIVED' | 'CANCELLED';
        supplierId?: string;
        startDate?: string;
        endDate?: string;
    }): Promise<PurchaseOrder[]> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.supplierId) params.append('supplierId', filters.supplierId);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);
        const response = await api.get(`/inventory/purchase-orders?${params.toString()}`);
        return response.data;
    },

    async getPurchaseOrder(id: string): Promise<PurchaseOrder> {
        const response = await api.get(`/inventory/purchase-orders/${id}`);
        return response.data;
    },

    async createPurchaseOrder(data: {
        supplierId: string;
        expectedDate?: string;
        items: Array<{
            productId: string;
            quantity: number;
            unitCost: number;
        }>;
        notes?: string;
    }): Promise<PurchaseOrder> {
        const response = await api.post('/inventory/purchase-orders', data);
        return response.data;
    },

    async createPurchaseOrderFromAlert(alertId: string): Promise<PurchaseOrder> {
        const response = await api.post(`/inventory/purchase-orders/from-alert/${alertId}`);
        return response.data;
    },

    async updatePurchaseOrder(id: string, data: {
        expectedDate?: string;
        notes?: string;
        items?: Array<{
            productId: string;
            quantity: number;
            unitCost: number;
        }>;
    }): Promise<PurchaseOrder> {
        const response = await api.put(`/inventory/purchase-orders/${id}`, data);
        return response.data;
    },

    async sendPurchaseOrder(id: string): Promise<PurchaseOrder> {
        const response = await api.put(`/inventory/purchase-orders/${id}/send`);
        return response.data;
    },

    async receivePurchaseOrder(id: string, items: Array<{
        itemId: string;
        receivedQty: number;
    }>): Promise<PurchaseOrder> {
        const response = await api.post(`/inventory/purchase-orders/${id}/receive`, { items });
        return response.data;
    },

    async cancelPurchaseOrder(id: string): Promise<PurchaseOrder> {
        const response = await api.delete(`/inventory/purchase-orders/${id}`);
        return response.data;
    },
};
