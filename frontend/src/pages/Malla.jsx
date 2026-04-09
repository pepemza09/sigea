import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Save, GripVertical } from 'lucide-react';
import { planesService, equivalenciasService } from '../services/api';
import toast from 'react-hot-toast';

export default function Malla() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [malla, setMalla] = useState(null);
  const [editingMateria, setEditingMateria] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadMalla();
  }, [id]);

  const loadMalla = async () => {
    try {
      const res = await planesService.getMalla(id);
      setMalla(res.data);
    } catch (error) {
      toast.error('Error al cargar la malla');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await planesService.update(editingMateria, editData);
      toast.success('Materia actualizada');
      setEditingMateria(null);
      loadMalla();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleReorder = async (anio, cuatrimestre, materiaId, newOrden) => {
    try {
      const currentMaterias = malla.estructura[anio][cuatrimestre];
      const updatedMaterias = currentMaterias.map(m => {
        if (m.id === materiaId) {
          return { ...m, orden: newOrden };
        }
        return m;
      });
      
      const newEstructura = { ...malla.estructura, [anio]: { ...malla.estructura[anio], [cuatrimestre]: updatedMaterias } };
      setMalla({ ...malla, estructura: newEstructura });
      
      const reorderData = updatedMaterias.map(m => ({ id: m.id, orden: m.orden }));
      await planesService.reorder(id, reorderData);
      toast.success('Orden guardado');
    } catch (error) {
      toast.error('Error al reordenar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!malla) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No se encontró el plan</p>
        <Link to="/planes" className="text-primary-500 hover:underline mt-2 inline-block">Volver a Planes</Link>
      </div>
    );
  }

  const { plan, estructura } = malla;
  const maxAnios = plan.duracion_anios || 4;

  const areaColors = {
    'Matemáticas': 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700',
    'Derecho': 'bg-gray-100 dark:bg-gray-700/30 border-gray-300 dark:border-gray-600',
    'Gestión y Estrategia': 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700',
    'Finanzas y Economía': 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700',
    'Marketing': 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700',
    'Administración de Personas': 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700',
    'Administración de Operaciones y Tecnología': 'bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700',
    'Profesional': 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/planes" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.nombre}</h1>
          <p className="text-gray-500 dark:text-gray-400">{plan.carrera_nombre} • {plan.anio_aprobacion}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Duración</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{plan.duracion_anios} años</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Carga Horaria</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{plan.carga_horaria_total} hs</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Créditos</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{plan.creditos_totales}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Materias</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{malla.estructura ? Object.values(malla.estructura).reduce((acc, anio) => acc + Object.values(anio).reduce((a, c) => a + c.length, 0), 0) : 0}</p>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 text-left bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 w-32">
                  Año
                </th>
                <th className="p-4 text-center bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  1° Cuatrimestre
                </th>
                <th className="p-4 text-center bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  2° Cuatrimestre
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: maxAnios }, (_, i) => i + 1).map((anio) => (
                <tr key={anio} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="p-4 font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/30">
                    {anio}° Año
                  </td>
                  {[1, 2].map((cuatri) => {
                    const materias = estructura?.[anio]?.[cuatri] || [];
                    return (
                      <td key={cuatri} className="p-4 align-top">
                        <div className="space-y-2 min-h-[100px]">
                          {materias.length > 0 ? (
                            materias.map((mp) => (
                              <div
                                key={mp.id}
                                className={`p-3 rounded-lg border-2 ${areaColors[mp.area_disciplinar] || 'bg-gray-100 dark:bg-gray-700/30 border-gray-200 dark:border-gray-600'} ${mp.es_optativa ? 'ring-2 ring-warning-500' : ''} ${mp.es_electiva ? 'ring-2 ring-primary-500' : ''}`}
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">{mp.materia_codigo}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{mp.materia_nombre}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                      {mp.materia_creditos} créditos • {mp.materia_horas_totales} hs
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{mp.area_disciplinar}</p>
                                  </div>
                                  <button
                                    onClick={() => { setEditingMateria(mp.id); setEditData(mp); }}
                                    className="p-1 hover:bg-white/50 dark:hover:bg-gray-600/50 rounded"
                                  >
                                    <Edit size={14} className="text-gray-500" />
                                  </button>
                                </div>
                                {mp.es_optativa && (
                                  <span className="mt-2 badge badge-warning text-xs">Optativa</span>
                                )}
                                {mp.es_electiva && (
                                  <span className="mt-2 badge badge-primary text-xs">Electiva</span>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 italic">Sin materias</p>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingMateria && (
        <div className="modal-overlay" onClick={() => setEditingMateria(null)}>
          <div className="modal p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Editar Materia del Plan</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código</label>
                <input type="text" value={editData.materia_codigo || ''} className="input" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" value={editData.materia_nombre || ''} className="input" disabled />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Año</label>
                  <select
                    value={editData.anio_cursado || 1}
                    onChange={(e) => setEditData({ ...editData, anio_cursado: parseInt(e.target.value) })}
                    className="input"
                  >
                    {Array.from({ length: maxAnios }, (_, i) => i + 1).map(a => (
                      <option key={a} value={a}>{a}° Año</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Cuatrimestre</label>
                  <select
                    value={editData.cuatrimestre || 1}
                    onChange={(e) => setEditData({ ...editData, cuatrimestre: parseInt(e.target.value) })}
                    className="input"
                  >
                    <option value={1}>1° Cuatrimestre</option>
                    <option value={2}>2° Cuatrimestre</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área Disciplinar</label>
                <select
                  value={editData.area_disciplinar || ''}
                  onChange={(e) => setEditData({ ...editData, area_disciplinar: e.target.value })}
                  className="input"
                >
                  <option value="Matemáticas">Matemáticas</option>
                  <option value="Derecho">Derecho</option>
                  <option value="Gestión y Estrategia">Gestión y Estrategia</option>
                  <option value="Finanzas y Economía">Finanzas y Economía</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Administración de Personas">Administración de Personas</option>
                  <option value="Administración de Operaciones y Tecnología">Administración de Operaciones y Tecnología</option>
                  <option value="Profesional">Profesional</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Formato</label>
                <select
                  value={editData.formato || ''}
                  onChange={(e) => setEditData({ ...editData, formato: e.target.value })}
                  className="input"
                >
                  <option value="Teórico aplicado">Teórico aplicado</option>
                  <option value="Taller">Taller</option>
                  <option value="Aplicación práctica de la Teoría">Aplicación práctica de la Teoría</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.es_optativa || false}
                    onChange={(e) => setEditData({ ...editData, es_optativa: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Optativa</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editData.es_electiva || false}
                    onChange={(e) => setEditData({ ...editData, es_electiva: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Electiva</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button onClick={() => setEditingMateria(null)} className="btn btn-secondary">Cancelar</button>
                <button onClick={handleSaveEdit} className="btn btn-primary">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
