import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';
import Dialog from '../components/Dialog';

export default function Areas() {
  const [areas, setAreas] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState(null);
  const [filtroPlan, setFiltroPlan] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    plan_de_estudio: ''
  });

  useEffect(() => {
    fetchAreas();
    fetchPlanes();
  }, []);

  const fetchAreas = async () => {
    try {
      const response = await api.get('/planes/areas/');
      setAreas(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar las áreas');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlanes = async () => {
    try {
      const response = await api.get('/planes/');
      setPlanes(response.data.results || response.data);
    } catch (error) {
      console.error('Error al cargar los planes:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await api.put(`/planes/areas/${editingArea.id}/`, formData);
        toast.success('Área actualizada correctamente');
      } else {
        await api.post('/planes/areas/', formData);
        toast.success('Área creada correctamente');
      }
      setShowModal(false);
      setEditingArea(null);
      setFormData({ nombre: '', descripcion: '', plan_de_estudio: '' });
      fetchAreas();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar el área');
    }
  };

  const handleEdit = (area) => {
    setEditingArea(area);
    setFormData({
      nombre: area.nombre,
      descripcion: area.descripcion || '',
      plan_de_estudio: area.plan_de_estudio
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar esta área?')) return;
    try {
      await api.delete(`/planes/areas/${id}/`);
      toast.success('Área eliminada correctamente');
      fetchAreas();
    } catch (error) {
      toast.error('Error al eliminar el área');
    }
  };

  const filteredAreas = filtroPlan 
    ? areas.filter(a => a.plan_de_estudio === parseInt(filtroPlan))
    : areas;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Áreas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de áreas por plan de estudio</p>
        </div>
        <button
          onClick={() => {
            setEditingArea(null);
            setFormData({ nombre: '', descripcion: '', plan_de_estudio: '' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Área
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <select
            value={filtroPlan}
            onChange={(e) => setFiltroPlan(e.target.value)}
            className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Todos los planes</option>
            {planes.map(plan => (
              <option key={plan.id} value={plan.id}>{plan.nombre}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Plan de Estudio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredAreas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay áreas registradas
                  </td>
                </tr>
              ) : (
                filteredAreas.map((area) => (
                  <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {area.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {area.plan_de_estudio_nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {area.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(area)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(area.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={`${editingArea ? 'Editar' : 'Nueva'} Área`}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Plan de Estudio *
            </label>
            <select
              required
              value={formData.plan_de_estudio}
              onChange={(e) => setFormData({ ...formData, plan_de_estudio: e.target.value })}
              className="input"
            >
              <option value="">Seleccionar plan</option>
              {planes.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="input"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {editingArea ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}