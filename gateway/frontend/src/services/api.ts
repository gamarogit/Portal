import axios from 'axios';

// La URL de la API es relativa para que el proxy de Vite la intercepte.
const API_URL = import.meta.env.VITE_API_URL || '';

console.log('🔧 API Configuration:', { API_URL, origin: window.location.origin });

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
});

// Interceptor para agregar el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface PortalSystem {
  id: string;
  name: string;
  description: string;
  icon: string;
  route: string;
  apiUrl: string | null;
  color: string;
  enabled: boolean;
  order: number;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const systemsService = {
  async getAll(): Promise<PortalSystem[]> {
    const response = await api.get('/portal/systems');
    return response.data.systems || response.data;
  },
};

export { api };
export default api;
