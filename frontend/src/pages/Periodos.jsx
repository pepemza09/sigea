import { useState, useEffect } from 'react';
import { periodosService } from '../services/api';
import toast from 'react-hot-toast';
import Dialog from '../components/Dialog';
import { Calendar, Check, X } from 'lucide-react';

const TIPOS = [
  { value: 'anual', label: 'Anual' },
  { value: 'cuatrimestral', label: 'Cuatrimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'trimestral', label: 'Trimestral' },
];

const ESTADOS = [
  { value: 'borrador', label: 'Borrador', color: 'gray' },
  { value: 'inscripcion', label: 'Inscripción', color: 'blue' },
  { value: 'activo', label: 'Activo', color: 'green' },
  { value: 'cerrado', label: 'Cerrado', color: 'red' },
];

export default function Periodos() {
  const [periodos, setPeriodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriodo, setEditingPeriodo] = useState(null);
  const [filtroAnio, setFiltroAnio] = useState('');
  const [aniosDisponibles, setAniosDisponibles] = useState([]);

  const [formData, setFormData] = useState({
    nombre: '',
    anio: new Date().getFullYear(),
    numero: 1,
    tipo: 'cuatrimestral',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_inicio_inscripcion: '',
    fecha_fin_inscripcion: '',
    estado: 'borrador',
    es_actual: false,
    observaciones: ''
  });

  useEffect(() => {
    fetchPeriodos();
  }, []);

  const fetchPeriodos = async () => {
    try {
      const response = await periodosService.getAll();
      const data = response.data.results || response.data;
      setPeriodos(data);
      const anios = [...new Set(data.map(p => p.anio))].sort((a, b) => b - a);
      setAniosDisponibles(anios);
      if (anios.length > 0 && !filtroAnio) {
        setFiltroAnio(anios[0].toString());
      }
    } catch (error) {
      toast.error('Error al cargar los períodos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...formData };
      dataToSend.anio = parseInt(dataToSend.anio);
      dataToSend.numero = parseInt(dataToSend.numero);

      if (editingPeriodo) {
        await periodosService.update(editingPeriodo.id, dataToSend);
        toast.success('Período actualizado correctamente');
      } else {
        await periodosService.create(dataToSend);
        toast.success('Período creado correctamente');
      }
      setShowModal(false);
      setEditingPeriodo(null);
      resetForm();
      fetchPeriodos();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar el período');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este período lectivo?')) return;
    try {
      await periodosService.delete(id);
      toast.success('Período eliminado correctamente');
      fetchPeriodos();
    } catch (error) {
      toast.error('Error al eliminar el período');
    }
  };

  const handleEdit = (periodo) => {
    setEditingPeriodo(periodo);
    setFormData({
      nombre: periodo.nombre,
      anio: periodo.anio,
      numero: periodo.numero,
      tipo: periodo.tipo,
      fecha_inicio: periodo.fecha_inicio,
      fecha_fin: periodo.fecha_fin,
      fecha_inicio_inscripcion: periodo.fecha_inicio_inscripcion || '',
      fecha_fin_inscripcion: periodo.fecha_fin_inscripcion || '',
      estado: periodo.estado,
      es_actual: periodo.es_actual,
      observaciones: periodo.observaciones || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      anio: new Date().getFullYear(),
      numero: 1,
      tipo: 'cuatrimestral',
      fecha_inicio: '',
      fecha_fin: '',
      fecha_inicio_inscripcion: '',
      fecha_fin_inscripcion: '',
      estado: 'borrador',
      es_actual: false,
      observaciones: ''
    });
  };

  const filteredPeriodos = filtroAnio
    ? periodos.filter(p => p.anio.toString() === filtroAnio)
    : periodos;

  const getEstadoBadge = (estado) => {
    const estadoInfo = ESTADOS.find(e => e.value === estado);
    const colors = {
      gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[estadoInfo?.color || 'gray']}`}>
        {estadoInfo?.label || estado}
      </span>
    );
  };

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Períodos Lectivos</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de ciclos académicos y períodos de inscripción</p>
        </div>
        <button
          onClick={() => {
            setEditingPeriodo(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Período
        </button>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <select
            value={filtroAnio}
            onChange={(e) => setFiltroAnio(e.target.value)}
            className="input py-2"
          >
            <option value="">Todos los años</option>
            {aniosDisponibles.map(anio => (
              <option key={anio} value={anio}>{anio}</option>
            ))}
          </select>
        </div>
        {periodos.find(p => p.es_actual) && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">
              Período actual: {periodos.find(p => p.es_actual)?.nombre}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fechas</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actual</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPeriodos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay períodos registrados
                  </td>
                </tr>
              ) : (
                filteredPeriodos.map((periodo) => (
                  <tr key={periodo.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-500" />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">{periodo.nombre}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {periodo.anio}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {periodo.tipo_display}
                    </td>
                    <td className="px-6 py-4">
                      {getEstadoBadge(periodo.estado)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div>{periodo.fecha_inicio} - {periodo.fecha_fin}</div>
                      {periodo.fecha_inicio_inscripcion && (
                        <div className="text-xs text-gray-400">
                          Insc: {periodo.fecha_inicio_inscripcion} - {periodo.fecha_fin_inscripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {periodo.es_actual ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 dark:text-gray-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(periodo)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(periodo.id)}
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
        title={editingPeriodo ? 'Editar Período' : 'Nuevo Período'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="Ej: 1er Cuatrimestre 2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="input"
              >
                {TIPOS.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Año *
              </label>
              <input
                type="number"
                required
                value={formData.anio}
                onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                className="input"
                min={2020}
                max={2100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número *
              </label>
              <input
                type="number"
                required
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                className="input"
                min={1}
                max={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado *
              </label>
              <select
                required
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="input"
              >
                {ESTADOS.map(estado => (
                  <option key={estado.value} value={estado.value}>{estado.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de inicio *
              </label>
              <input
                type="date"
                required
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha de fin *
              </label>
              <input
                type="date"
                required
                value={formData.fecha_fin}
                onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Inicio de inscripción
              </label>
              <input
                type="date"
                value={formData.fecha_inicio_inscripcion}
                onChange={(e) => setFormData({ ...formData, fecha_inicio_inscripcion: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fin de inscripción
              </label>
              <input
                type="date"
                value={formData.fecha_fin_inscripcion}
                onChange={(e) => setFormData({ ...formData, fecha_fin_inscripcion: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={2}
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.es_actual}
              onChange={(e) => setFormData({ ...formData, es_actual: e.target.checked })}
              className="rounded text-primary-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Marcar como período actual</span>
          </label>
          <div className="flex justify-end gap-2 pt-4">
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
              {editingPeriodo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
