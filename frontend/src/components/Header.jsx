import { useLocation } from 'react-router-dom';
import { useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, Bell, Search, ChevronLeft, ChevronRight, LogOut, Moon, Sun, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const breadcrumbMap = {
  '/': 'Dashboard',
  '/unidades-academicas': 'Unidades Académicas',
  '/carreras': 'Carreras',
  '/planes': 'Planes de Estudio',
  '/materias': 'Materias',
  '/equivalencias': 'Equivalencias',
  '/configuraciones': 'Configuración',
};

export default function Header({ setSidebarOpen, isCollapsed, setIsCollapsed }) {
  const location = useLocation();
  const currentPage = breadcrumbMap[location.pathname] || 'Página';
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const getCsrf = async () => {
      try {
        const response = await fetch('/api/', { credentials: 'include' });
        const cookie = document.cookie;
        const match = cookie.match(/csrftoken=([^;]+)/);
        if (match) setCsrfToken(match[1]);
      } catch (e) {}
    };
    getCsrf();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        credentials: 'include',
      });
    } catch (e) {}
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-14">
      <div className="flex items-center justify-between px-3 h-full lg:px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
            title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} className="text-gray-600 dark:text-gray-300" /> : <ChevronLeft size={18} className="text-gray-600 dark:text-gray-300" />}
          </button>
          
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          
          <nav className="hidden sm:flex items-center text-sm">
            <span className="text-gray-500 dark:text-gray-400">SIGeA</span>
            <span className="mx-1.5 text-gray-400">/</span>
            <span className="font-medium text-gray-900 dark:text-white">{currentPage}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="bg-transparent border-none outline-none text-sm text-gray-700 dark:text-gray-300 placeholder-gray-400 w-40"
            />
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
            title={theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          >
            {theme === 'dark' ? <Sun size={18} className="text-gray-600 dark:text-gray-300" /> : <Moon size={18} className="text-gray-600 dark:text-gray-300" />}
          </button>
          
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95 relative">
            <Bell size={18} className="text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-danger-500 rounded-full"></span>
          </button>

          <Link
            to="/configuraciones"
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
            title="Configuración"
          >
            <Settings size={18} className="text-gray-600 dark:text-gray-300" />
          </Link>

          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
            <span className="hidden md:block text-sm text-gray-600 dark:text-gray-300">{user?.username}</span>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
              title="Cerrar sesión"
            >
              <LogOut size={18} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
