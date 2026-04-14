import axios from 'axios';

const API_BASE_URL = '/api';

const getCsrfToken = () => {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : '';
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers['X-CSRFToken'] = getCsrfToken();
  return config;
});

export const unidadesAcademicasService = {
  getAll: () => api.get('unidades-academicas/'),
  getById: (id) => api.get(`unidades-academicas/${id}/`),
  create: (data) => api.post('unidades-academicas/', data),
  update: (id, data) => api.put(`unidades-academicas/${id}/`, data),
  delete: (id) => api.delete(`unidades-academicas/${id}/`),
};

export const carrerasService = {
  getAll: () => api.get('carreras/'),
  getById: (id) => api.get(`carreras/${id}/`),
  create: (data) => api.post('carreras/', data),
  update: (id, data) => api.put(`carreras/${id}/`, data),
  delete: (id) => api.delete(`carreras/${id}/`),
  getPlanes: (id) => api.get(`carreras/${id}/planes/`),
};

export const planesService = {
  getAll: () => api.get('planes/'),
  getById: (id) => api.get(`planes/${id}/`),
  create: (data) => api.post('planes/', data),
  update: (id, data) => api.put(`planes/${id}/`, data),
  delete: (id) => api.delete(`planes/${id}/`),
  getMaterias: (id) => api.get(`planes/${id}/materias/`),
  getMalla: (id) => api.get(`planes/${id}/malla/`),
  reorder: (id, materias) => api.post(`planes/${id}/reordenar/`, { materias }),
  clonar: (id, data) => api.post(`planes/${id}/clonar/`, data),
  addMateria: (id, data) => api.post(`planes/${id}/agregar_materia/`, data),
  addMateriaToMateria: (planId, data) => api.post(`planes/${planId}/agregar_materia_desde_materia/`, data),
  removeMateriaFromMateria: (planId, materiaId) => api.post(`planes/${planId}/eliminar_materia_desde_materia/`, { materia_id: materiaId }),
};

export const areasService = {
  getAll: () => api.get('planes/areas/'),
  getById: (id) => api.get(`planes/areas/${id}/`),
  create: (data) => api.post('planes/areas/', data),
  update: (id, data) => api.put(`planes/areas/${id}/`, data),
  delete: (id) => api.delete(`planes/areas/${id}/`),
  autocomplete: (query, planId) => {
    let url = 'planes/areas/autocomplete/';
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (planId) params.append('plan_id', planId);
    if (params.toString()) url += '?' + params.toString();
    return api.get(url);
  },
};

export const materiasService = {
  getAll: () => api.get('materias/'),
  getById: (id) => api.get(`materias/${id}/`),
  create: (data) => api.post('materias/', data),
  update: (id, data) => api.put(`materias/${id}/`, data),
  delete: (id) => api.delete(`materias/${id}/`),
  associatePlan: (materiaId, planId) => api.post(`materias/${materiaId}/associate_plan/`, { plan_id: planId }),
  dissociatePlan: (materiaId, planId) => api.post(`materias/${materiaId}/dissociate_plan/`, { plan_id: planId }),
};

export const equivalenciasService = {
  getAll: () => api.get('equivalencias/'),
  getById: (id) => api.get(`equivalencias/${id}/`),
  create: (data) => api.post('equivalencias/', data),
  update: (id, data) => api.put(`equivalencias/${id}/`, data),
  delete: (id) => api.delete(`equivalencias/${id}/`),
  comparativa: (planOrigenId, planDestinoId) => 
    api.get(`equivalencias/comparativa/?plan_origen_id=${planOrigenId}&plan_destino_id=${planDestinoId}`),
  checkMateria: (materiaId) => api.get(`equivalencias/check_materia/?materia_id=${materiaId}`),
  agregarDetalle: (id, data) => api.post(`equivalencias/${id}/agregar_detalle/`, data),
  editarDetalle: (id, detalleId, data) => api.patch(`equivalencias/${id}/editar_detalle/${detalleId}/`, data),
  eliminarDetalle: (id, detalleId) => api.delete(`equivalencias/${id}/eliminar_detalle/${detalleId}/`),
};

export default api;
