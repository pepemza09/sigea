import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { unidadesAcademicasService } from '../services/api';
import toast from 'react-hot-toast';
import { ConfirmModal, AlertModal } from '../components/Modal';

export default function UnidadesAcademicas() {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ nombre: '', sigla: '', descripcion: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadUnidades();
  }, [search]);

  const loadUnidades = async () => {
    try {
      const res = await unidadesAcademicasService.getAll();
      let data = res.data.results || res.data;
      if (search) {
        data = data.filter(u => 
          u.nombre.toLowerCase().includes(search.toLowerCase()) ||
          u.sigla.toLowerCase().includes(search.toLowerCase())
        );
      }
      setUnidades(data);
    } catch (error) {
      toast.error('Error al cargar unidades académicas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await unidadesAcademicasService.update(editing, formData);
        toast.success('Unidad académica actualizada');
      } else {
        await unidadesAcademicasService.create(formData);
        toast.success('Unidad académica creada');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({ nombre: '', sigla: '', descripcion: '' });
      loadUnidades();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (unidad) => {
    setEditing(unidad.id);
    setFormData({ nombre: unidad.nombre, sigla: unidad.sigla, descripcion: unidad.descripcion });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await unidadesAcademicasService.delete(deleteId);
      toast.success('Unidad académica eliminada');
      loadUnidades();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No se puede eliminar: tiene carreras asociadas');
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unidades Académicas</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de facultades, escuelas e institutos</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData({ nombre: '', sigla: '', descripcion: '' }); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Unidad
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Sigla</th>
                <th>Carreras</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {unidades.length > 0 ? (
                unidades.map((unidad) => (
                  <tr key={unidad.id}>
                    <td className="font-medium">{unidad.nombre}</td>
                    <td><span className="badge badge-primary">{unidad.sigla}</span></td>
                    <td>{unidad.carreras_count || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(unidad)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(unidad.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Trash2 size={18} className="text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">No hay unidades académicas</td>
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
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editing ? 'Editar' : 'Nueva'} Unidad Académica</h3>
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
              <div>
                <label className="block text-sm font-medium mb-1">Sigla</label>
                <input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input"
                  rows={3}
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
        message="¿Está seguro de eliminar esta unidad académica?"
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
