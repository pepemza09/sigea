import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, GraduationCap, BookOpen, FileText, ArrowLeftRight, TrendingUp, Clock, Plus } from 'lucide-react';
import { unidadesAcademicasService, carrerasService, planesService, materiasService } from '../services/api';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const [stats, setStats] = useState({
    unidadesAcademicas: 0,
    carreras: 0,
    planes: 0,
    materias: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recientes, setRecientes] = useState([]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [uaRes, carRes, planesRes, matRes] = await Promise.all([
        unidadesAcademicasService.getAll(),
        carrerasService.getAll(),
        planesService.getAll(),
        materiasService.getAll(),
      ]);

      setStats({
        unidadesAcademicas: uaRes.data.count || uaRes.data.results?.length || 0,
        carreras: carRes.data.count || carRes.data.results?.length || 0,
        planes: planesRes.data.count || planesRes.data.results?.length || 0,
        materias: matRes.data.count || matRes.data.results?.length || 0,
      });

      setRecientes(planesRes.data.results?.slice(0, 5) || []);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Unidades Académicas', value: stats.unidadesAcademicas, icon: Building2, color: 'bg-blue-500', path: '/unidades-academicas' },
    { title: 'Carreras', value: stats.carreras, icon: GraduationCap, color: 'bg-green-500', path: '/carreras' },
    { title: 'Planes de Estudio', value: stats.planes, icon: BookOpen, color: 'bg-purple-500', path: '/planes' },
    { title: 'Materias', value: stats.materias, icon: FileText, color: 'bg-orange-500', path: '/materias' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Sistema Integral de Gestión Académica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.path}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Últimos Planes Modificados</h2>
            <Link to="/planes" className="text-sm text-primary-500 hover:text-primary-600">Ver todos</Link>
          </div>
          <div className="space-y-3">
            {recientes.length > 0 ? (
              recientes.map((plan) => (
                <Link
                  key={plan.id}
                  to={`/planes/${plan.id}/malla`}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{plan.nombre}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.carrera_nombre}</p>
                  </div>
                  <div className="text-right">
                    <span className={`badge ${plan.es_vigente ? 'badge-success' : 'badge-warning'}`}>
                      {plan.es_vigente ? 'Vigente' : 'No vigente'}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">{plan.anio_aprobacion}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No hay planes disponibles</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Accesos Rápidos</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/equivalencias" className="flex items-center gap-3 p-4 rounded-lg bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors">
              <ArrowLeftRight className="text-primary-500" size={24} />
              <span className="font-medium text-primary-700 dark:text-primary-400">Gestionar Equivalencias</span>
            </Link>
            <Link to="/planes" className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors">
              <BookOpen className="text-green-500" size={24} />
              <span className="font-medium text-green-700 dark:text-green-400">Ver Mallas Curriculares</span>
            </Link>
            <Link to="/materias" className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/30 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors">
              <FileText className="text-orange-500" size={24} />
              <span className="font-medium text-orange-700 dark:text-orange-400">Catálogo de Materias</span>
            </Link>
            <Link to="/carreras" className="flex items-center gap-3 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors">
              <GraduationCap className="text-purple-500" size={24} />
              <span className="font-medium text-purple-700 dark:text-purple-400">Gestionar Carreras</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
