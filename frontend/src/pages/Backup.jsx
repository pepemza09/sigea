import { useState } from 'react';
import { backupService } from '../services/api';
import toast from 'react-hot-toast';
import { Database, Download, Upload, FileJson, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

const TIPOS_EXPORT = [
  { value: 'completo', label: 'Respaldo Completo', description: 'Todos los datos del sistema' },
  { value: 'unidades', label: 'Unidades Académicas', description: 'Solo facultades e institutos' },
  { value: 'carreras', label: 'Carreras', description: 'Carreras y titulaciones' },
  { value: 'planes', label: 'Planes de Estudio', description: 'Planes y áreas' },
  { value: 'materias', label: 'Materias', description: 'Materias y malla curricular' },
  { value: 'equivalencias', label: 'Equivalencias', description: 'Tablas de equivalencias' },
];

export default function Backup() {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [lastBackup, setLastBackup] = useState(null);

  const handleExport = async (tipo, formato) => {
    setLoading(true);
    try {
      const response = await backupService.export(tipo, formato);
      const blob = new Blob([response.data], { type: formato === 'json' ? 'application/json' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `backup_${tipo}_${new Date().toISOString().split('T')[0]}.${formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setLastBackup(new Date().toLocaleString());
      toast.success(`Backup ${tipo} descargado correctamente`);
    } catch (error) {
      toast.error('Error al generar el backup');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    const file = e.target.file.files[0];
    if (!file) {
      toast.error('Seleccione un archivo');
      return;
    }
    if (!file.name.endsWith('.json')) {
      toast.error('Solo se permiten archivos JSON');
      return;
    }
    setImporting(true);
    try {
      const response = await backupService.import(file);
      toast.success(response.data?.status || 'Importación completada');
      setShowImportModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al importar los datos');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Respaldo de Datos</h1>
        <p className="text-gray-500 dark:text-gray-400">Exportar e importar información del sistema</p>
      </div>

      {lastBackup && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <Check className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 dark:text-green-400">
            Último backup: {lastBackup}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Download className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Exportar Datos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Descarga una copia de seguridad</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {TIPOS_EXPORT.map((tipo) => (
              <div key={tipo.value} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{tipo.label}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{tipo.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleExport(tipo.value, 'json')}
                    disabled={loading}
                    className="btn btn-secondary flex items-center gap-2"
                  >
                    <FileJson className="h-4 w-4" />
                    JSON
                  </button>
                  {tipo.value !== 'completo' && (
                    <button
                      onClick={() => handleExport(tipo.value, 'csv')}
                      disabled={loading}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Upload className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Importar Datos</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Restaurar desde un backup</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Database className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Importar desde archivo JSON
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Seleccione un archivo de backup previamente exportado
              </p>
              <button
                onClick={() => setShowImportModal(true)}
                className="btn btn-primary"
              >
                Seleccionar archivo
              </button>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-700 dark:text-yellow-400">Consideraciones importantes</h4>
                  <ul className="text-sm text-yellow-600 dark:text-yellow-300 mt-2 space-y-1 list-disc list-inside">
                    <li>La importación solo procesa archivos JSON válidos</li>
                    <li>Los datos existentes no serán eliminados</li>
                    <li>Se omitirán registros duplicados</li>
                    <li>Se recomienda hacer un backup antes de importar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Importar Datos</h2>
            </div>
            <form onSubmit={handleImport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Archivo JSON *
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".json"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn btn-secondary"
                  disabled={importing}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex items-center gap-2"
                  disabled={importing}
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Importar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
