import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save, X, ArrowRight } from 'lucide-react';
import { equivalenciasService, planesService } from '../services/api';
import toast from 'react-hot-toast';

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

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de eliminar esta equivalencia?')) return;
    try {
      await equivalenciasService.delete(id);
      toast.success('Equivalencia eliminada');
      loadData();
    } catch (error) {
      const msg = error.response?.data?.detail || 'Error al eliminar';
      toast.error(msg);
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

  const handleDeleteDetalle = async (detalleId) => {
    if (!confirm('¿Está seguro de eliminar este detalle?')) return;
    try {
      await equivalenciasService.eliminarDetalle(selectedEq.id, detalleId);
      toast.success('Detalle eliminado');
      loadData();
      handleVerComparativa(selectedEq);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message || 'Error al eliminar';
      toast.error(msg);
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
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Nueva Equivalencia</h2>
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
        <div className="modal-overlay" onClick={() => setShowCompareModal(false)}>
          <div className="fixed inset-4 md:inset-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-auto flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold">Detalle de Equivalencia</h2>
              <button onClick={() => setShowCompareModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="card p-3 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500">Plan Origen</p>
                <p className="font-medium">{selectedEq?.plan_origen_nombre}</p>
              </div>
              <div className="card p-3 bg-gray-50 dark:bg-gray-700/50">
                <p className="text-sm text-gray-500">Plan Destino</p>
                <p className="font-medium">{selectedEq?.plan_destino_nombre}</p>
              </div>
            </div>

            <div className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm font-medium mb-2">Agregar Nueva Equivalencia</p>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={editDetalleData.materia_origen || ''}
                  onChange={(e) => setEditDetalleData({ ...editDetalleData, materia_origen: parseInt(e.target.value) })}
                  className="input text-sm"
                >
                  <option value="">Materia Origen</option>
                  {comparativa.plan_origen.map(m => (
                    <option key={m.id} value={m.id}>{m.materia_codigo} - {m.materia_nombre}</option>
                  ))}
                </select>
                <div className="flex items-center justify-center">
                  <ArrowRight size={20} className="text-gray-400" />
                </div>
                <select
                  value={editDetalleData.materia_destino || ''}
                  onChange={(e) => setEditDetalleData({ ...editDetalleData, materia_destino: parseInt(e.target.value) })}
                  className="input text-sm"
                >
                  <option value="">Materia Destino</option>
                  {comparativa.plan_destino.map(m => (
                    <option key={m.id} value={m.id}>{m.materia_codigo} - {m.materia_nombre}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-2">
                <select
                  value={editDetalleData.tipo || ''}
                  onChange={(e) => setEditDetalleData({ ...editDetalleData, tipo: e.target.value })}
                  className="input text-sm flex-1"
                >
                  <option value="">Tipo</option>
                  <option value="1:1">Uno a uno</option>
                  <option value="1:N">Una origen a varias destino</option>
                  <option value="N:1">Varias origen a una destino</option>
                </select>
                <button onClick={handleAddDetalle} className="btn btn-primary text-sm px-3">
                  <Plus size={16} /> Agregar
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="table text-sm">
                <thead>
                  <tr>
                    <th>Materia Origen</th>
                    <th>Tipo</th>
                    <th>Materia Destino</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comparativa.plan_origen.map((mpOrigen) => {
                    const detalle = selectedEq?.detalles?.find(d => d.materia_origen === mpOrigen.id);
                    const mpDestino = comparativa.plan_destino.find(md => 
                      detalle?.materia_destino === md.id
                    );
                    
                    return (
                      <tr key={mpOrigen.id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs">{mpOrigen.materia_codigo}</span>
                            <span>{mpOrigen.materia_nombre}</span>
                          </div>
                        </td>
                        <td>
                          {detalle ? (
                            editingDetalle === detalle.id ? (
                              <select
                                value={editDetalleData.tipo || detalle.tipo}
                                onChange={(e) => setEditDetalleData({ ...editDetalleData, tipo: e.target.value })}
                                className="input text-xs w-32"
                              >
                                <option value="1:1">Uno a uno</option>
                                <option value="1:N">Una origen a varias</option>
                                <option value="N:1">Varias origen a una</option>
                              </select>
                            ) : (
                              <span className="badge badge-primary">{detalle.tipo}</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td>
                          {mpDestino ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{mpDestino.materia_codigo}</span>
                              <span>{mpDestino.materia_nombre}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td>
                          {detalle ? (
                            editingDetalle === detalle.id ? (
                              <div className="flex items-center gap-1">
                                <button onClick={handleSaveDetalle} className="p-1 text-success-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                  <Save size={16} />
                                </button>
                                <button onClick={() => { setEditingDetalle(null); setEditDetalleData({}); }} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                  <X size={16} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => { setEditingDetalle(detalle.id); setEditDetalleData(detalle); }} 
                                  className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteDetalle(detalle.id)} 
                                  className="p-1 text-danger-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )
                          ) : (
                            <span className="text-gray-400 text-xs">Sin equivalencia</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
