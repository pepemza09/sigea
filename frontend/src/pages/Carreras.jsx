import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { carrerasService, unidadesAcademicasService } from '../services/api';
import toast from 'react-hot-toast';
import { ConfirmModal, AlertModal } from '../components/Modal';

export default function Carreras() {
  const [carreras, setCarreras] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterUnidad, setFilterUnidad] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ codigo: '', nombre: '', unidad_academica: '', duracion_anios: 4 });

  useEffect(() => {
    loadData();
  }, [search, filterUnidad]);

  const loadData = async () => {
    try {
      const [carrRes, uaRes] = await Promise.all([
        carrerasService.getAll(),
        unidadesAcademicasService.getAll()
      ]);
      
      setUnidades(uaRes.data.results || uaRes.data);
      
      let data = carrRes.data.results || carrRes.data;
      if (search) {
        data = data.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()));
      }
      if (filterUnidad) {
        data = data.filter(c => c.unidad_academica === parseInt(filterUnidad));
      }
      setCarreras(data);
    } catch (error) {
      toast.error('Error al cargar carreras');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await carrerasService.update(editing, formData);
        toast.success('Carrera actualizada');
      } else {
        await carrerasService.create(formData);
        toast.success('Carrera creada');
      }
      setShowModal(false);
      setEditing(null);
setFormData({ codigo: '', nombre: '', unidad_academica: '', duracion_anios: 4 });
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (carrera) => {
    setEditing(carrera.id);
    setFormData({ 
      codigo: carrera.codigo,
      nombre: carrera.nombre, 
      unidad_academica: carrera.unidad_academica, 
      duracion_anios: carrera.duracion_anios 
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await carrerasService.delete(deleteId);
      toast.success('Carrera eliminada');
      loadData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No se puede eliminar');
      setShowDeleteModal(false);
      setShowErrorModal(true);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Carreras</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de carreras y títulos</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData({ nombre: '', unidad_academica: '', duracion_anios: 4 }); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Carrera
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
            value={filterUnidad}
            onChange={(e) => setFilterUnidad(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todas las unidades</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Unidad Académica</th>
                <th>Duración</th>
                <th>Planes</th>
                <th>Plan Vigente</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carreras.length > 0 ? (
                carreras.map((carrera) => (
                  <tr key={carrera.id}>
                    <td><span className="font-mono font-medium text-primary-600">{carrera.codigo}</span></td>
                    <td className="font-medium">{carrera.nombre}</td>
                    <td>{carrera.unidad_academica_sigla}</td>
                    <td>{carrera.duracion_anios} años</td>
                    <td>{carrera.planes_count || 0}</td>
                    <td>
                      {carrera.plan_vigente ? (
                        <span className="badge badge-success">Vigente</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(carrera)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(carrera.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Trash2 size={18} className="text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No hay carreras</td>
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Editar' : 'Nueva'} Carrera</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
                  className="input"
                  placeholder="LDA"
                  required
                  disabled={!!editing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
<<<<<<< HEAD
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
=======
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
>>>>>>> e248274726075556f82a2df4418481677aeeb79f
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unidad Académica</label>
                <select
                  value={formData.unidad_academica}
                  onChange={(e) => setFormData({ ...formData, unidad_academica: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar unidad</option>
                  {unidades.map(u => (
                    <option key={u.id} value={u.id}>{u.nombre}</option>
                  ))}
                </select>
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
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
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
        message="¿Está seguro de eliminar esta carrera?"
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
