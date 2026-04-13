import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, ArrowRight } from 'lucide-react';
import { equivalenciasService, planesService } from '../services/api';
import toast from 'react-hot-toast';
import { ConfirmModal, AlertModal } from '../components/Modal';

export default function Equivalencias() {
  const [equivalencias, setEquivalencias] = useState([]);
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [comparativa, setComparativa] = useState(null);
  const [filterOrigen, setFilterOrigen] = useState('');
  const [filterDestino, setFilterDestino] = useState('');
  const [newEq, setNewEq] = useState({ plan_origen: '', plan_destino: '' });
  const [editingDetalle, setEditingDetalle] = useState(null);
  const [editDetalleData, setEditDetalleData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDetalleModal, setShowDeleteDetalleModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteDetalleId, setDeleteDetalleId] = useState(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eqRes, planesRes] = await Promise.all([
        equivalenciasService.getAll(),
        planesService.getAll()
      ]);
      setEquivalencias(eqRes.data.results || eqRes.data);
      setPlanes(planesRes.data.results || planesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredEquivalencias = equivalencias.filter(eq => {
    if (filterOrigen && eq.plan_origen !== parseInt(filterOrigen)) return false;
    if (filterDestino && eq.plan_destino !== parseInt(filterDestino)) return false;
    return true;
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await equivalenciasService.create(newEq);
      toast.success('Equivalencia creada');
      setShowCreateModal(false);
      setNewEq({ plan_origen: '', plan_destino: '' });
      loadData();
    } catch (error) {
      toast.error('Error al crear equivalencia');
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await equivalenciasService.delete(deleteId);
      toast.success('Equivalencia eliminada');
      loadData();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Error al eliminar');
      setShowDeleteModal(false);
      setShowErrorModal(true);
    }
  };

  const handleVerComparativa = async (eq) => {
    try {
      setSelectedEq(eq);
      const res = await equivalenciasService.comparativa(eq.plan_origen, eq.plan_destino);
      setComparativa(res.data);
      setShowCompareModal(true);
    } catch (error) {
      toast.error('Error al cargar comparativa');
    }
  };

  const handleSaveDetalle = async () => {
    try {
      await equivalenciasService.editarDetalle(selectedEq.id, editingDetalle, editDetalleData);
      toast.success('Detalle actualizado');
      setEditingDetalle(null);
      loadData();
      handleVerComparativa(selectedEq);
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleAddDetalle = async () => {
    if (!editDetalleData.materia_origen || !editDetalleData.materia_destino || !editDetalleData.tipo) {
      toast.error('Complete todos los campos');
      return;
    }
    try {
      await equivalenciasService.agregarDetalle(selectedEq.id, editDetalleData);
      toast.success('Detalle agregado');
      setEditDetalleData({});
      loadData();
      handleVerComparativa(selectedEq);
    } catch (error) {
      toast.error('Error al agregar');
    }
  };

  const handleDeleteDetalle = (detalleId) => {
    setDeleteDetalleId(detalleId);
    setShowDeleteDetalleModal(true);
  };

  const confirmDeleteDetalle = async () => {
    try {
      await equivalenciasService.eliminarDetalle(selectedEq.id, deleteDetalleId);
      toast.success('Detalle eliminado');
      loadData();
      handleVerComparativa(selectedEq);
      setShowDeleteDetalleModal(false);
      setDeleteDetalleId(null);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || 'Error al eliminar');
      setShowDeleteDetalleModal(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Equivalencias</h1>
          <p className="text-gray-500 dark:text-gray-400">Gestión de equivalencias entre planes de estudio</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn btn-primary flex items-center gap-2">
          <Plus size={20} /> Nueva Equivalencia
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select
            value={filterOrigen}
            onChange={(e) => setFilterOrigen(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todos los origen</option>
            {planes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
          <select
            value={filterDestino}
            onChange={(e) => setFilterDestino(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">Todos los destino</option>
            {planes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th>Plan Origen</th>
                <th>Plan Destino</th>
                <th>Detalles</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEquivalencias.length > 0 ? (
                filteredEquivalencias.map((eq) => (
                  <tr key={eq.id}>
                    <td className="font-medium">{eq.plan_origen_nombre}</td>
                    <td className="font-medium">{eq.plan_destino_nombre}</td>
                    <td>{eq.detalles?.length || 0} materias</td>
                    <td>{new Date(eq.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleVerComparativa(eq)} className="btn btn-secondary text-sm py-1 px-2">
                          Ver Detalles
                        </button>
                        <button onClick={() => handleDelete(eq.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                          <Trash2 size={18} className="text-danger-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No hay equivalencias</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowCreateModal(false)} />
          <div className="relative z-10 w-full max-w-4xl rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Nueva Equivalencia</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 text-xl">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Plan Origen</label>
                <select
                  value={newEq.plan_origen}
                  onChange={(e) => setNewEq({ ...newEq, plan_origen: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar plan</option>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Plan Destino</label>
                <select
                  value={newEq.plan_destino}
                  onChange={(e) => setNewEq({ ...newEq, plan_destino: parseInt(e.target.value) })}
                  className="input"
                  required
                >
                  <option value="">Seleccionar plan</option>
                  {planes.map(p => (
                    <option key={p.id} value={p.id}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCompareModal && comparativa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500/75" onClick={() => setShowCompareModal(false)} />
          <div className="relative z-10 bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Detalle de Equivalencia</h2>
                <p className="text-sm text-gray-500">{selectedEq?.plan_origen_nombre} → {selectedEq?.plan_destino_nombre}</p>
              </div>
              <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-medium mb-3">Nueva Equivalencia</p>
              <form onSubmit={(e) => { e.preventDefault(); handleAddDetalle(); }} className="grid grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Materia Origen</label>
                  <select
                    value={editDetalleData.materia_origen || ''}
                    onChange={(e) => setEditDetalleData({ ...editDetalleData, materia_origen: parseInt(e.target.value) })}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar materia</option>
                    {comparativa.plan_origen.filter(m => !selectedEq?.detalles?.some(d => d.materia_origen === m.id)).map(m => (
                      <option key={m.id} value={m.id}>{m.materia_codigo} - {m.materia_nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tipo de Equivalencia</label>
                  <select
                    value={editDetalleData.tipo || ''}
                    onChange={(e) => setEditDetalleData({ ...editDetalleData, tipo: e.target.value })}
                    className="input"
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="1:1">Uno a uno (1:1)</option>
                    <option value="1:N">Una a varias (1:N)</option>
                    <option value="N:1">Varias a una (N:1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Materia Destino</label>
                  <div className="flex gap-2">
                    <select
                      value={editDetalleData.materia_destino || ''}
                      onChange={(e) => setEditDetalleData({ ...editDetalleData, materia_destino: parseInt(e.target.value) })}
                      className="input flex-1"
                      required
                    >
                      <option value="">Seleccionar materia</option>
                      {comparativa.plan_destino.map(m => (
                        <option key={m.id} value={m.id}>{m.materia_codigo} - {m.materia_nombre}</option>
                      ))}
                    </select>
                    <button type="submit" className="btn btn-primary">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-sm font-medium mb-3">Equivalencias Configuradas ({selectedEq?.detalles?.length || 0})</p>
              {selectedEq?.detalles?.length > 0 ? (
                <div className="space-y-2">
                  {selectedEq.detalles.map((detalle) => {
                    const mpOrigen = comparativa.plan_origen.find(m => m.id === detalle.materia_origen);
                    const mpDestino = comparativa.plan_destino.find(m => m.id === detalle.materia_destino);
                    
                    return (
                      <div key={detalle.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">{mpOrigen?.materia_codigo}</span>
                            <span className="text-sm">{mpOrigen?.materia_nombre}</span>
                          </div>
                        </div>
                        <div className="px-3">
                          {editingDetalle === detalle.id ? (
                            <select
                              value={editDetalleData.tipo || detalle.tipo}
                              onChange={(e) => setEditDetalleData({ ...editDetalleData, tipo: e.target.value })}
                              className="input text-sm w-32"
                            >
                              <option value="1:1">Uno a uno</option>
                              <option value="1:N">Una origen a varias</option>
                              <option value="N:1">Varias origen a una</option>
                            </select>
                          ) : (
                            <span className="badge badge-primary">{detalle.tipo}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <ArrowRight size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-success-100 text-success-700 px-2 py-0.5 rounded">{mpDestino?.materia_codigo}</span>
                            <span className="text-sm">{mpDestino?.materia_nombre}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {editingDetalle === detalle.id ? (
                            <>
                              <button onClick={handleSaveDetalle} className="p-1 text-success-500 hover:bg-gray-200 rounded" title="Guardar">
                                <Save size={18} />
                              </button>
                              <button onClick={() => { setEditingDetalle(null); setEditDetalleData({}); }} className="p-1 text-gray-500 hover:bg-gray-200 rounded" title="Cancelar">
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => { setEditingDetalle(detalle.id); setEditDetalleData(detalle); }} 
                                className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteDetalle(detalle.id)} 
                                className="p-1 text-danger-500 hover:bg-gray-200 rounded"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay equivalencias configuradas</p>
                  <p className="text-sm">Agregue una equivalencia usando el formulario acima</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar eliminación"
        message="¿Está seguro de eliminar esta equivalencia?"
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      <ConfirmModal
        open={showDeleteDetalleModal}
        onClose={() => setShowDeleteDetalleModal(false)}
        onConfirm={confirmDeleteDetalle}
        title="Confirmar eliminación"
        message="¿Está seguro de eliminar este detalle de equivalencia?"
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
