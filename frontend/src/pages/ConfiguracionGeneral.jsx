import { useState, useEffect } from 'react';
import { configuracionService } from '../services/api';
import toast from 'react-hot-toast';
import Dialog from '../components/Dialog';
import { Globe, Info, Settings } from 'lucide-react';

export default function ConfiguracionGeneral() {
  const [settings, setSettings] = useState([]);
  const [appInfo, setAppInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState(null);

  const [formData, setFormData] = useState({
    clave: '',
    valor: '',
    descripcion: '',
    es_sensible: false
  });

  useEffect(() => {
    fetchSettings();
    fetchAppInfo();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await configuracionService.getSettings();
      setSettings(response.data.results || response.data);
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppInfo = async () => {
    try {
      const response = await configuracionService.getAppInfo();
      setAppInfo(response.data);
    } catch (error) {
      console.error('Error al cargar info de la app:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSetting) {
        await configuracionService.updateSetting(editingSetting.clave, formData);
        toast.success('Configuración actualizada correctamente');
      } else {
        await configuracionService.createSetting(formData);
        toast.success('Configuración creada correctamente');
      }
      setShowModal(false);
      setEditingSetting(null);
      resetForm();
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.clave?.[0] || 'Error al guardar la configuración');
    }
  };

  const handleDelete = async (clave) => {
    if (!window.confirm('¿Está seguro de eliminar esta configuración?')) return;
    try {
      await configuracionService.deleteSetting(clave);
      toast.success('Configuración eliminada correctamente');
      fetchSettings();
    } catch (error) {
      toast.error('Error al eliminar la configuración');
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setFormData({
      clave: setting.clave,
      valor: '',
      descripcion: setting.descripcion || '',
      es_sensible: setting.es_sensible
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      clave: '',
      valor: '',
      descripcion: '',
      es_sensible: false
    });
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración General</h1>
          <p className="text-gray-500 dark:text-gray-400">Parámetros generales del sistema</p>
        </div>
        <button
          onClick={() => {
            setEditingSetting(null);
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Configuración
        </button>
      </div>

      {appInfo && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <Info className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Información del Sistema</h2>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Aplicación</p>
                <p className="font-medium text-gray-900 dark:text-white">{appInfo.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Versión</p>
                <p className="font-medium text-gray-900 dark:text-white">{appInfo.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Entorno</p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                  appInfo.entorno === 'production'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {appInfo.entorno}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Python</p>
                <p className="font-medium text-gray-900 dark:text-white">{appInfo.python_version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Django</p>
                <p className="font-medium text-gray-900 dark:text-white">{appInfo.django_version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Base de Datos</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">{appInfo.base_datos}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Settings className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Configuraciones Personalizadas</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Variables de configuración del sistema</p>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Clave</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Sensible</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {settings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No hay configuraciones personalizadas
                  </td>
                </tr>
              ) : (
                settings.map((setting) => (
                  <tr key={setting.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                        {setting.clave}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {setting.es_sensible ? '••••••••' : setting.valor}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {setting.descripcion || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {setting.es_sensible ? (
                        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full">
                          Sí
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded-full">
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(setting)}
                        className="text-primary-500 hover:text-primary-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(setting.clave)}
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
        title={editingSetting ? 'Editar Configuración' : 'Nueva Configuración'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Clave *
            </label>
            <input
              type="text"
              required
              disabled={!!editingSetting}
              value={formData.clave}
              onChange={(e) => setFormData({ ...formData, clave: e.target.value })}
              className="input disabled:opacity-50"
              placeholder="NOMBRE_CONFIGURACION"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Valor *
            </label>
            {editingSetting?.es_sensible ? (
              <input
                type="password"
                required
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                className="input"
                placeholder="Dejar vacío para mantener el valor actual"
              />
            ) : (
              <textarea
                required
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                rows={3}
                className="input"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={2}
              className="input"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.es_sensible}
              onChange={(e) => setFormData({ ...formData, es_sensible: e.target.checked })}
              className="rounded text-primary-500"
            />
            <span className="text-gray-700 dark:text-gray-300">Valor sensible (contraseña, clave, etc.)</span>
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
              {editingSetting ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
