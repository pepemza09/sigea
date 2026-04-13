import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { planesService, carrerasService } from '../services/api';
import toast from 'react-hot-toast';
import { ConfirmModal, AlertModal } from '../components/Modal';

export default function Planes() {
  const [planes, setPlanes] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCarrera, setFilterCarrera] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showCloneModal, setShowCloneModal] = useState(false);
  const [cloneData, setCloneData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    nombre: '',
    anio_aprobacion: new Date().getFullYear(),
    carrera: '',
    duracion_anios: 4,
    carga_horaria_total: 0,
    creditos_totales: 0,
    es_vigente: false
  });

  useEffect(() => {
    loadData();
  }, [search, filterCarrera]);

  const loadData = async () => {
    try {
      const [planesRes, carRes] = await Promise.all([
        planesService.getAll(),
        carrerasService.getAll()
      ]);
      
      setCarreras(carRes.data.results || carRes.data);
      
      let data = planesRes.data.results || planesRes.data;
      if (search) {
        data = data.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));
      }
      if (filterCarrera) {
        data = data.filter(p => p.carrera === parseInt(filterCarrera));
      }
      setPlanes(data);
    } catch (error) {
      toast.error('Error al cargar planes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await planesService.update(editing, formData);
        toast.success('Plan actualizado');
      } else {
        await planesService.create(formData);
        toast.success('Plan creado');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({
        nombre: '',
        anio_aprobacion: new Date().getFullYear(),
        carrera: '',
        duracion_anios: 4,
        carga_horaria_total: 0,
        creditos_totales: 0,
        es_vigente: false
      });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (plan) => {
    setEditing(plan.id);
    setFormData({
      nombre: plan.nombre,
      anio_aprobacion: plan.anio_aprobacion,
      carrera: plan.carrera,
      duracion_anios: plan.duracion_anios,
      carga_horaria_total: plan.carga_horaria_total,
      creditos_totales: plan.creditos_totales,
      es_vigente: plan.es_vigente
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await planesService.delete(deleteId);
      toast.success('Plan eliminado');
      loadData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No se puede eliminar: tiene materias asociadas');
      setShowDeleteModal(false);
      setShowErrorModal(true);
    }
  };

  const handleClone = async (e) => {
    e.preventDefault();
    try {
      await planesService.clonar(cloneData.id, { nombre: cloneData.nombre });
      toast.success('Plan clonado');
      setShowCloneModal(false);
      setCloneData(null);
      loadData();
    } catch (error) {
      toast.error('Error al clonar plan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Planes de Estudio</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de planes curriculares</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData({
          nombre: '',
          anio_aprobacion: new Date().getFullYear(),
          carrera: '',
          duracion_anios: 4,
          carga_horaria_total: 0,
          creditos_totales: 0,
          es_vigente: false
        }); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Nuevo Plan
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex items-center gap-2 flex-1">
            <Search size={20} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
          </div>
          <select
            value={filterCarrera}
            onChange={(e) => setFilterCarrera(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todas las carreras</option>
            {carreras.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Carrera</th>
                <th>Año</th>
                <th>Duración</th>
                <th>Horas</th>
                <th>Créditos</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {planes.length > 0 ? (
                planes.map((plan) => (
                  <tr key={plan.id}>
                    <td className="font-medium">{plan.nombre}</td>
                    <td>{plan.carrera_nombre}</td>
                    <td>{plan.anio_aprobacion}</td>
                    <td>{plan.duracion_anios} años</td>
                    <td>{plan.carga_horaria_total}</td>
                    <td>{plan.creditos_totales}</td>
                    <td>
                      <span className={`badge ${plan.es_vigente ? 'badge-success' : 'badge-warning'}`}>
                        {plan.es_vigente ? 'Vigente' : 'No vigente'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link to={`/planes/${plan.id}/malla`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Ver Malla">
                          <Eye size={18} className="text-primary-500" />
                        </Link>
                        <button onClick={() => { setCloneData({ id: plan.id, nombre: `${plan.nombre} (copia)` }); setShowCloneModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Clonar">
                          <Copy size={18} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleEdit(plan)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Trash2 size={18} className="text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">No hay planes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-4xl rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Editar' : 'Nuevo'} Plan de Estudio</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Año de Aprobación</label>
                  <input
                    type="number"
                    value={formData.anio_aprobacion}
                    onChange={(e) => setFormData({ ...formData, anio_aprobacion: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Duración (años)</label>
                  <input
                    type="number"
                    value={formData.duracion_anios}
                    onChange={(e) => setFormData({ ...formData, duracion_anios: parseInt(e.target.value) })}
                    className="input"
                    min={1}
                    max={10}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Carrera</label>
                <select
                  value={formData.carrera}
                  onChange={(e) => setFormData({ ...formData, carrera: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar carrera</option>
                  {carreras.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Carga Horaria Total</label>
                  <input
                    type="number"
                    value={formData.carga_horaria_total}
                    onChange={(e) => setFormData({ ...formData, carga_horaria_total: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Créditos Totales</label>
                  <input
                    type="number"
                    value={formData.creditos_totales}
                    onChange={(e) => setFormData({ ...formData, creditos_totales: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="es_vigente"
                  checked={formData.es_vigente}
                  onChange={(e) => setFormData({ ...formData, es_vigente: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="es_vigente" className="text-sm font-medium">Plan Vigente</label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCloneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowCloneModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Clonar Plan de Estudio</h2>
              <button onClick={() => setShowCloneModal(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500 text-xl">✕</button>
            </div>
            <form onSubmit={handleClone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Copia</label>
                <input
                  type="text"
                  value={cloneData?.nombre || ''}
                  onChange={(e) => setCloneData({ ...cloneData, nombre: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCloneModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Clonar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de eliminar este plan de estudio?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <AlertModal
        open={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title="¡Error!"
        message={errorMessage}
        buttonText="Entendido"
        type="danger"
      />
    </div>
  );
}
