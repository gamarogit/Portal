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

export const inventoryService = {
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
};
