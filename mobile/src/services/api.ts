import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'http://http://172.28.134.213:80/api';

// Configurar axios
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// interceptor para añadirtoken CSRF
api.interceptors.request.use(async (config) => {
  const csrfToken = await SecureStore.getItemAsync('csrftoken');
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  return config;
});

// interceptor para obtener CSRF token
api.interceptors.response.use(async (response) => {
  const cookie = response.headers['set-cookie'] as string | undefined;
  if (cookie) {
    const match = cookie.match(/csrftoken=([^;]+)/);
    if (match) {
      await SecureStore.setItemAsync('csrftoken', match[1]);
    }
  }
  return response;
});

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login/', { username, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },
  currentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },
};

// Carreras API
export const carrerasAPI = {
  getAll: async () => {
    const response = await api.get('/carreras/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/carreras/${id}/`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/carreras/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/carreras/${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/carreras/${id}/`);
    return response.data;
  },
};

// Planes API
export const planesAPI = {
  getAll: async () => {
    const response = await api.get('/planes/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/planes/${id}/`);
    return response.data;
  },
  getMaterias: async (id: number) => {
    const response = await api.get(`/planes/${id}/materias/`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/planes/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/planes/${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/planes/${id}/`);
    return response.data;
  },
};

// Materias API
export const materiasAPI = {
  getAll: async () => {
    const response = await api.get('/materias/');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/materias/${id}/`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/materias/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/materias/${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/materias/${id}/`);
    return response.data;
  },
};

// Áreas API
export const areasAPI = {
  getAll: async () => {
    const response = await api.get('/planes/areas/');
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post('/planes/areas/', data);
    return response.data;
  },
  update: async (id: number, data: any) => {
    const response = await api.put(`/planes/areas/${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/planes/areas/${id}/`);
    return response.data;
  },
};

export default api;
