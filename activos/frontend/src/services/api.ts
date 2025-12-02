import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

let token: string | null = null;

export const setAuthToken = (newToken: string) => {
  token = newToken.trim();
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export interface AssetSummary {
  id: string;
  name: string;
  state: string;
  assetType?: { name: string };
  assetTypeId?: string;
  location?: { name: string };
  locationId?: string;
  responsible?: { name: string };
  responsibleId?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  operatingSystem?: string;
  cost?: number;
  purchaseDate?: string;
  warrantyUntil?: string;
  notes?: string;
}

export interface Movement {
  id: string;
  folio: string;
  assetId: string;
  asset?: { name: string; serialNumber?: string };
  movementType: 'ALTA' | 'BAJA' | 'TRASLADO';
  fromLocationId?: string;
  fromLocation?: { name: string };
  toLocationId?: string;
  toLocation?: { name: string };
  status: 'PENDIENTE' | 'EN_CURSO' | 'REALIZADO' | 'CANCELADO';
  notes?: string;
  createdAt: string;
}

export interface MovementPayload {
  assetId: string;
  movementType: 'ALTA' | 'BAJA' | 'TRASLADO';
  fromLocationId?: string;
  toLocationId?: string;
  notes?: string;
}

export interface MaintenancePayload {
  assetId: string;
  scheduledAt: string;
  performedById?: string;
  notes?: string;
}

export interface DepreciationPayload {
  assetId: string;
  periodStart: string;
  periodEnd: string;
  amount: number;
  method: string;
}

export const assetService = {
  list: () => api.get('/assets').then((res) => res.data.data || res.data || []),
  getOne: (id: string) => api.get<AssetSummary>(`/assets/${id}`).then((res) => res.data),
  create: (payload: {
    name: string;
    assetTypeId?: string;
    locationId?: string;
    responsibleId?: string | null;
    serialNumber?: string;
    cost?: number;
    operatingSystem?: string;
  }) => api.post('/assets', payload).then((res) => res.data),
  update: (id: string, payload: {
    name?: string;
    assetTypeId?: string;
    locationId?: string;
    responsibleId?: string | null;
    serialNumber?: string;
    cost?: number;
    operatingSystem?: string;
    state?: string;
  }) => api.put(`/assets/${id}`, payload).then((res) => res.data),
};

export const movementService = {
  list: () => api.get<any>('/movements').then((res) => res.data.data || res.data || []),
  create: (payload: MovementPayload) => api.post('/movements', payload).then((res) => res.data),
  updateStatus: (id: string, status: Movement['status']) => api.patch(`/movements/${id}/status`, { status }).then((res) => res.data),
};

export const maintenanceService = {
  create: (payload: MaintenancePayload) => api.post('/maintenance', payload).then((res) => res.data),
};

export const depreciationService = {
  create: (payload: DepreciationPayload) => api.post('/depreciations', payload).then((res) => res.data),
  listByAsset: (assetId: string) => api.get(`/depreciations/asset/${assetId}`).then((res) => res.data),
};

export const auditService = {
  byAsset: (assetId: string) => api.get(`/audits/asset/${assetId}`).then((res) => res.data),
};

export const reportService = {
  inventory: () => api.get('/reports/inventory').then((res) => res.data),
  depreciation: () => api.get('/reports/depreciation').then((res) => res.data),
};

export interface Role {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
  };
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserCatalog {
  id: string;
  name: string;
  email: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId?: string;
  role?: Role;
  createdAt: string;
  updatedAt: string;
}

export const roleService = {
  list: () => api.get<Role[]>('/roles').then((res) => res.data),
  getOne: (id: string) => api.get<Role>(`/roles/${id}`).then((res) => res.data),
  create: (payload: { name: string; description?: string }) =>
    api.post<Role>('/roles', payload).then((res) => res.data),
  update: (id: string, payload: { name?: string; description?: string }) =>
    api.put<Role>(`/roles/${id}`, payload).then((res) => res.data),
  delete: (id: string) => api.delete(`/roles/${id}`).then((res) => res.data),
};

export const userService = {
  list: () => api.get<User[]>('/users').then((res) => res.data),
  getOne: (id: string) => api.get<User>(`/users/${id}`).then((res) => res.data),
  create: (payload: { name: string; email: string; roleId?: string }) =>
    api.post<User>('/users', payload).then((res) => res.data),
  update: (id: string, payload: { name?: string; email?: string; roleId?: string | null }) =>
    api.put<User>(`/users/${id}`, payload).then((res) => res.data),
  delete: (id: string) => api.delete(`/users/${id}`).then((res) => res.data),
};

export const integrationService = {
  create: (event: { source: string; payload: Record<string, unknown> }) =>
    api.post('/integrations/event', event).then((res) => res.data),
  dispatch: (limit: number) => api.post(`/integrations/dispatch?limit=${limit}`).then((res) => res.data),
  list: (status?: string) => api.get(`/integrations/events${status ? `?status=${status}` : ''}`).then((res) => res.data),
  metrics: () => api.get('/metrics').then((res) => res.data),
};

export const devService = {
  createAssetType: (name: string) => api.post('/dev/asset-type', { name }).then((res) => res.data),
  createLocation: (name: string) => api.post('/dev/location', { name }).then((res) => res.data),
  createUser: (name: string) => api.post('/dev/user', { name }).then((res) => res.data),
  listAssetTypes: () => api.get<AssetType[]>('/dev/asset-types').then((res) => res.data),
  listLocations: () => api.get<Location[]>('/dev/locations').then((res) => res.data),
  listUsers: () => api.get<UserCatalog[]>('/dev/users').then((res) => res.data),
};

export interface CustomReport {
  id: string;
  title: string;
  description?: string;
  content: string;
  createdBy: string;
  creator?: { name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export const reportBuilderService = {
  list: () => api.get<CustomReport[]>('/report-builder').then((res) => res.data),
  getOne: (id: string) => api.get<CustomReport>(`/report-builder/${id}`).then((res) => res.data),
  create: (payload: { title: string; content: string; description?: string }) =>
    api.post<CustomReport>('/report-builder', payload).then((res) => res.data),
  update: (id: string, payload: { title?: string; content?: string; description?: string }) =>
    api.patch<CustomReport>(`/report-builder/${id}`, payload).then((res) => res.data),
  delete: (id: string) => api.delete(`/report-builder/${id}`).then((res) => res.data),
};

export default api;
