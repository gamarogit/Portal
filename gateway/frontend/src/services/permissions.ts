import { api } from './api';

export interface SystemPermission {
    id: string;
    userId: string;
    systemId: string;
    canAccess: boolean;
    system: {
        id: string;
        name: string;
        description: string;
        icon: string;
    };
}

export interface SystemFeature {
    id: string;
    systemId: string;
    key: string;
    name: string;
    description?: string;
    category?: string;
}

export interface FeaturePermission {
    id: string;
    userId: string;
    featureId: string;
    granted: boolean;
    feature: SystemFeature & {
        system: {
            id: string;
            name: string;
        };
    };
}

export interface UserPermissions {
    systems: SystemPermission[];
    features: FeaturePermission[];
}

export const permissionsService = {
    async getUserPermissions(userId: string): Promise<UserPermissions> {
        const response = await api.get(`/permissions/users/${userId}`);
        return response.data;
    },

    async updateSystemPermissions(
        userId: string,
        permissions: { systemId: string; canAccess: boolean }[]
    ) {
        const response = await api.put(`/permissions/users/${userId}/systems`, {
            permissions,
        });
        return response.data;
    },

    async updateFeaturePermissions(
        userId: string,
        permissions: { featureId: string; granted: boolean }[]
    ) {
        const response = await api.put(`/permissions/users/${userId}/features`, {
            permissions,
        });
        return response.data;
    },

    async getAllFeatures() {
        const response = await api.get('/permissions/features/all');
        return response.data;
    },

    async getSystemFeatures(systemId: string): Promise<SystemFeature[]> {
        const response = await api.get(`/permissions/systems/${systemId}/features`);
        return response.data;
    },
};
