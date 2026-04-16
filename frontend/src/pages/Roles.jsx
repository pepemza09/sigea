import { useState, useEffect } from 'react';
import { gruposService, permisosService } from '../services/api';
import toast from 'react-hot-toast';
import Dialog from '../components/Dialog';
import { Shield, Users, Check } from 'lucide-react';

export default function Roles() {
  const [grupos, setGrupos] = useState([]);
  const [permisos, setPermisos] = useState([]);
  const [permisosPorModelo, setPermisosPorModelo] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchGrupos();
    fetchPermisos();
  }, []);

  const fetchGrupos = async () => {
    try {
      const response = await gruposService.getAll();
      setGrupos(response.data.results || response.data);
    } catch (error) {
      toast.error('Error al cargar los grupos');
    } finally {
      setLoading(false);
    }
  };

  const fetchPermisos = async () => {
    try {
      const response = await permisosService.byContentType();
      setPermisosPorModelo(response.data);
      const allPermisos = Object.values(response.data).flatMap(ct => ct.permissions || []);
      setPermisos(allPermisos);
    } catch (error) {
      console.error('Error al cargar permisos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGrupo) {
        await gruposService.update(editingGrupo.id, formData);
        toast.success('Grupo actualizado correctamente');
      } else {
        await gruposService.create(formData);
        toast.success('Grupo creado correctamente');
      }
      setShowModal(false);
      setEditingGrupo(null);
      setFormData({ name: '' });
      fetchGrupos();
    } catch (error) {
      toast.error(error.response?.data?.name?.[0] || 'Error al guardar el grupo');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de eliminar este grupo?')) return;
    try {
      await gruposService.delete(id);
      toast.success('Grupo eliminado correctamente');
      fetchGrupos();
    } catch (error) {
      toast.error('Error al eliminar el grupo');
    }
  };

  const handleEdit = (grupo) => {
    setEditingGrupo(grupo);
    setFormData({ name: grupo.name });
    setShowModal(true);
  };

  const openPermissionsModal = (grupo) => {
    setSelectedGrupo(grupo);
    setSelectedPermissions(grupo.permissions_list?.map(p => p.id) || []);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async () => {
    try {
      await gruposService.setPermissions(selectedGrupo.id, selectedPermissions);
      toast.success('Permisos actualizados correctamente');
      setShowPermissionsModal(false);
      fetchGrupos();
    } catch (error) {
      toast.error('Error al guardar los permisos');
    }
  };

  const togglePermission = (permId) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  const modelos = Object.entries(permisosPorModelo);

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles y Permisos</h1>
          <p className="text-gray-500 dark:text-gray-400">Configuración de grupos y permisos de acceso</p>
        </div>
        <button
          onClick={() => {
            setEditingGrupo(null);
            setFormData({ name: '' });
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nuevo Rol
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {grupos.map((grupo) => (
          <div key={grupo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{grupo.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    {grupo.user_count} usuario{grupo.user_count !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openPermissionsModal(grupo)}
                  className="p-2 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                  title="Editar permisos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => handleEdit(grupo)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(grupo.id)}
                  className="p-2 text-red-400 hover:text-red-600 rounded-lg"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 000-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            {grupo.permissions_list && grupo.permissions_list.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Permisos:</p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  {grupo.permissions_list.slice(0, 5).map(p => (
                    <span key={p.id} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                      {p.name}
                    </span>
                  ))}
                  {grupo.permissions_list.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                      +{grupo.permissions_list.length - 5} más
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
        {grupos.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No hay roles registrados
          </div>
        )}
      </div>

      <Dialog
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingGrupo ? 'Editar Rol' : 'Nuevo Rol'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del rol *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Ej: Editor, Admin, Visualizador"
            />
          </div>
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
              {editingGrupo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Dialog>

      <Dialog
        isOpen={showPermissionsModal}
        onClose={() => setShowPermissionsModal(false)}
        title={`Permisos - ${selectedGrupo?.name}`}
        size="2xl"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {modelos.map(([modelo, data]) => (
            <div key={modelo} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3 capitalize">
                {modelo.split('.').pop()} ({data.name})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {data.permissions?.map(p => (
                  <label
                    key={p.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                      selectedPermissions.includes(p.id)
                        ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(p.id)}
                      onChange={() => togglePermission(p.id)}
                      className="rounded text-primary-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedPermissions.length} permisos seleccionados
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPermissionsModal(false)}
              className="btn btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleSavePermissions}
              className="btn btn-primary"
            >
              Guardar Permisos
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
