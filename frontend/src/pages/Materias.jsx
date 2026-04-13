import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen, X } from 'lucide-react';
import { materiasService, planesService } from '../services/api';
import toast from 'react-hot-toast';
import { ConfirmModal, AlertModal } from '../components/Modal';

export default function Materias() {
  const [materias, setMaterias] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPlansModal, setShowPlansModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [materiaToDelete, setMateriaToDelete] = useState(null);
  const [materiaForPlans, setMateriaForPlans] = useState(null);
  const [associatedPlans, setAssociatedPlans] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    horas_interaccion_pedagogica: 0,
    horas_trabajo_autonomo: 0,
    horas_totales: 0,
    creditos: 0,
    anio_cuatrimestre_default: 1,
    cuatrimestre_default: 1
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

  const loadPlanes = async () => {
    try {
      const res = await planesService.getAll();
      setPlanes(res.data.results || res.data);
    } catch (error) {
      toast.error('Error al cargar planes');
    }
  };

  const handleShowPlans = async (materia) => {
    setMateriaForPlans(materia);
    await loadPlanes();
    setShowPlansModal(true);
    try {
      const res = await materiasService.getById(materia.id);
      setAssociatedPlans(res.data.planes || []);
    } catch (err) {
      setAssociatedPlans(materia.planes || []);
    }
  };

  const handleAssociatePlan = async (planId) => {
    const planIdNum = Number(planId);
    try {
      await materiasService.associatePlan(materiaForPlans.id, planIdNum);
      toast.success('Materia asociada al plan');
      await handleShowPlans(materiaForPlans);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al asociar');
    }
  };

  const handleRemovePlan = async (materiaPlanId, planId) => {
    const planIdNum = Number(planId);
    try {
      await materiasService.dissociatePlan(materiaForPlans.id, planIdNum);
      toast.success('Materia desasociada del plan');
      await handleShowPlans(materiaForPlans);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al desasociar');
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
        creditos: 0,
        anio_cuatrimestre_default: 1,
        cuatrimestre_default: 1
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
      creditos: materia.creditos,
      anio_cuatrimestre_default: materia.anio_cuatrimestre_default || 1,
      cuatrimestre_default: materia.cuatrimestre_default || 1
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
                        <button onClick={() => handleShowPlans(materia)} className="badge badge-primary hover:bg-primary-600 cursor-pointer">
                          {materia.planes_count} planes
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleShowPlans(materia)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg" title="Ver planes">
                          <BookOpen size={18} className="text-primary-500" />
                        </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{editing ? 'Editar' : 'Nueva'} Materia</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500 text-xl">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
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
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value.toUpperCase() })}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Año por defecto</label>
                  <select
                    value={formData.anio_cuatrimestre_default}
                    onChange={(e) => setFormData({ ...formData, anio_cuatrimestre_default: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    <option value={1}>1° Año</option>
                    <option value={2}>2° Año</option>
                    <option value={3}>3° Año</option>
                    <option value={4}>4° Año</option>
                    <option value={5}>5° Año</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cuatrimestre por defecto</label>
                  <select
                    value={formData.cuatrimestre_default}
                    onChange={(e) => setFormData({ ...formData, cuatrimestre_default: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    <option value={1}>1° Cuatrimestre</option>
                    <option value={2}>2° Cuatrimestre</option>
                  </select>
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

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de eliminar esta materia?"
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

      {showPlansModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => { setShowPlansModal(false); loadMaterias(); }} />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Planes de Estudio</h2>
                <p className="text-sm text-gray-500">{materiaForPlans?.codigo} - {materiaForPlans?.nombre}</p>
              </div>
              <button onClick={() => setShowPlansModal(false)} className="p-1 hover:bg-gray-100 rounded text-gray-500 text-xl">✕</button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Asociar a Plan</label>
              <div className="flex gap-2">
                <select
                  id="planSelect"
                  className="input flex-1"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssociatePlan(parseInt(e.target.value));
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Seleccionar plan...</option>
                  {planes.filter(p => !associatedPlans.some(ap => Number(ap.plan_de_estudio) === Number(p.id))).map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Planes Asociados ({associatedPlans.length})</p>
              {associatedPlans.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {associatedPlans.map(plan => (
                    <div key={plan.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-primary-500" />
                        <span className="text-sm">{plan.plan_nombre}</span>
                      </div>
                      <button
                        onClick={() => handleRemovePlan(plan.id, plan.plan_de_estudio)}
                        className="p-1 hover:bg-gray-200 rounded text-danger-500"
                        title="Desasociar"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Esta materia no está asociada a ningún plan</p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={() => { setShowPlansModal(false); loadMaterias(); }} className="btn btn-primary">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
