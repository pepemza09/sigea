import { Users, Calendar, Building2, BookOpen, FileText, Database, Shield, Globe } from 'lucide-react';

const settingsCards = [
  {
    id: 'usuarios',
    title: 'Usuarios',
    description: 'Administrar usuarios del sistema y permisos',
    icon: Users,
    path: '/configuraciones/usuarios',
    color: 'bg-blue-500'
  },
  {
    id: 'periodos',
    title: 'Períodos Lectivos',
    description: 'Configurar ciclos académicos y períodos de inscripción',
    icon: Calendar,
    path: '/configuraciones/periodos',
    color: 'bg-green-500'
  },
  {
    id: 'unidades',
    title: 'Unidades Académicas',
    description: 'Administrar facultades, escuelas e institutos',
    icon: Building2,
    path: '/unidades-academicas',
    color: 'bg-purple-500'
  },
  {
    id: 'carreras',
    title: 'Carreras',
    description: 'Gestionar carreras y titulaciones',
    icon: BookOpen,
    path: '/carreras',
    color: 'bg-orange-500'
  },
  {
    id: 'materias',
    title: 'Materias',
    description: 'Catálogo de materias y correlatividades',
    icon: FileText,
    path: '/materias',
    color: 'bg-red-500'
  },
  {
    id: 'planes',
    title: 'Planes de Estudio',
    description: 'Administrar planes curriculares',
    icon: FileText,
    path: '/planes',
    color: 'bg-teal-500'
  },
  {
    id: 'backup',
    title: 'Respaldo de Datos',
    description: 'Exportar e importar información del sistema',
    icon: Database,
    path: '/configuraciones/backup',
    color: 'bg-gray-500'
  },
  {
    id: 'roles',
    title: 'Roles y Permisos',
    description: 'Configurar niveles de acceso',
    icon: Shield,
    path: '/configuraciones/roles',
    color: 'bg-indigo-500'
  },
  {
    id: 'general',
    title: 'Configuración General',
    description: 'Parámetros generales del sistema',
    icon: Globe,
    path: '/configuraciones/general',
    color: 'bg-yellow-500'
  }
];

export default function Configuraciones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-gray-500 dark:text-gray-400">Administra las configuraciones del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {settingsCards.map((card) => {
          const Icon = card.icon;
          return (
            <a
              key={card.id}
              href={card.path}
              className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${card.color} text-white`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {card.description}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}