import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  Building2,
  GraduationCap,
  BookOpen,
  FileText,
  ArrowLeftRight,
  LayoutDashboard,
  Moon,
  Sun,
  X
} from 'lucide-react';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/unidades-academicas', icon: Building2, label: 'Unidades Académicas' },
  { path: '/carreras', icon: GraduationCap, label: 'Carreras' },
  { path: '/planes', icon: BookOpen, label: 'Planes de Estudio' },
  { path: '/materias', icon: FileText, label: 'Materias' },
  { path: '/equivalencias', icon: ArrowLeftRight, label: 'Equivalencias' },
];

export default function Sidebar({ isOpen, setIsOpen, isCollapsed }) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-2 left-4 z-50 p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isOpen ? <X size={18} /> : null}
      </button>

      <div className={`sidebar ${theme === 'dark' ? 'sidebar-dark' : 'sidebar-light'} ${sidebarWidth} ${isOpen ? 'sidebar-visible' : 'sidebar-hidden'} transition-all duration-300`}>
        <div className="flex flex-col h-full">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 h-14 flex items-center">
            <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center w-full' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="hidden">
  <filter id="makeWhite">
    <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/>
  </filter>
</svg>
<img 
                src="https://media.licdn.com/dms/image/v2/D4D0BAQHfA7Zs3POWgw/company-logo_200_200/B4DZUeo4GqHkAI-/0/1739975787365/uncuyo_logo?e=2147483647&v=beta&t=24FA_QC0EJIVP2qbOZncNhopERjnBp5mPkPlBJJst1k" 
                alt="UNCuyo" 
                className="w-10 h-10 rounded-lg object-cover bg-white"
              />
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">SIGeA</h1>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Gestión Académica</p>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm ${isCollapsed ? 'justify-center' : ''}`}
              title={isCollapsed ? (theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro') : undefined}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              {!isCollapsed && (
                <span className="font-medium">
                  {theme === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
