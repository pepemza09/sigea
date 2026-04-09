import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { materiasService } from '../services/api';
import toast from 'react-hot-toast';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [materiaToDelete, setMateriaToDelete] = useState(null);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    horas_interaccion_pedagogica: 0,
    horas_trabajo_autonomo: 0,
    horas_totales: 0,
    creditos: 0
  });

  useEffect(() => {
    loadMaterias();
  }, [search]);

  const loadMaterias = async () => {
    try {
      const res = await materiasService.getAll();
      let data = res.data.results || res.data;
      if (search) {
        data = data.filter(m => 
          m.codigo.toLowerCase().includes(search.toLowerCase()) ||
          m.nombre.toLowerCase().includes(search.toLowerCase())
        );
      }
      setMaterias(data);
    } catch (error) {
      toast.error('Error al cargar materias');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await materiasService.update(editing, formData);
        toast.success('Materia actualizada');
      } else {
        await materiasService.create(formData);
        toast.success('Materia creada');
      }
      setShowModal(false);
      setEditing(null);
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        horas_interaccion_pedagogica: 0,
        horas_trabajo_autonomo: 0,
        horas_totales: 0,
        creditos: 0
      });
      loadMaterias();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (materia) => {
    setEditing(materia.id);
    setFormData({
      codigo: materia.codigo,
      nombre: materia.nombre,
      descripcion: materia.descripcion || '',
      horas_interaccion_pedagogica: materia.horas_interaccion_pedagogica,
      horas_trabajo_autonomo: materia.horas_trabajo_autonomo,
      horas_totales: materia.horas_totales,
      creditos: materia.creditos
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    setMateriaToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await materiasService.delete(materiaToDelete);
      toast.success('Materia eliminada');
      loadMaterias();
      setShowDeleteModal(false);
      setMateriaToDelete(null);
    } catch (error) {
      console.log('Delete error:', error);
      console.log('Response:', error.response);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message || 'No se puede eliminar';
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
      setShowDeleteModal(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Materias</h1>
          <p className="text-gray-500 dark:text-gray-400">Catálogo global de materias</p>
        </div>
        <button onClick={() => { setEditing(null); setFormData({
          codigo: '',
          nombre: '',
          descripcion: '',
          horas_interaccion_pedagogica: 0,
          horas_trabajo_autonomo: 0,
          horas_totales: 0,
          creditos: 0
        }); setShowModal(true); }} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Materia
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por código o nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Horas Totales</th>
                <th>Créditos</th>
                <th>Planes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materias.length > 0 ? (
                materias.map((materia) => (
                  <tr key={materia.id}>
                    <td><span className="font-mono font-medium">{materia.codigo}</span></td>
                    <td className="font-medium">{materia.nombre}</td>
                    <td>{materia.horas_totales}</td>
                    <td>{materia.creditos}</td>
                    <td>
                      {materia.planes_count > 0 ? (
                        <span className="badge badge-primary">{materia.planes_count} planes</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(materia)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Edit size={18} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(materia.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Trash2 size={18} className="text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No hay materias</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{editing ? 'Editar' : 'Nueva'} Materia</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="input"
                  placeholder="570101"
                  required
                  disabled={!!editing}
                />
              </div>
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
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Horas Interacción Pedagógica</label>
                  <input
                    type="number"
                    value={formData.horas_interaccion_pedagogica}
                    onChange={(e) => setFormData({ ...formData, horas_interaccion_pedagogica: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Horas Trabajo Autónomo</label>
                  <input
                    type="number"
                    value={formData.horas_trabajo_autonomo}
                    onChange={(e) => setFormData({ ...formData, horas_trabajo_autonomo: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Horas Totales</label>
                  <input
                    type="number"
                    value={formData.horas_totales}
                    onChange={(e) => setFormData({ ...formData, horas_totales: parseInt(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Créditos</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.creditos}
                    onChange={(e) => setFormData({ ...formData, creditos: parseFloat(e.target.value) })}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Confirmar eliminación</h3>
              <button onClick={() => setShowDeleteModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">¿Está seguro de eliminar esta materia?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 btn btn-secondary">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 btn btn-danger">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowErrorModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-danger-500">Error</h3>
              <button onClick={() => setShowErrorModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{errorMessage}</p>
            <button onClick={() => setShowErrorModal(false)} className="w-full btn btn-primary">Aceptar</button>
          </div>
        </div>
      )}
    </div>
  );
}
