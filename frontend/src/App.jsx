import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import UnidadesAcademicas from './pages/UnidadesAcademicas';
import Carreras from './pages/Carreras';
import Planes from './pages/Planes';
import Malla from './pages/Malla';
import Areas from './pages/Areas';
import Materias from './pages/Materias';
import Equivalencias from './pages/Equivalencias';
import Configuraciones from './pages/Configuraciones';
import Usuarios from './pages/Usuarios';
import Periodos from './pages/Periodos';
import Roles from './pages/Roles';
import Backup from './pages/Backup';
import ConfiguracionGeneral from './pages/ConfiguracionGeneral';
import Login from './pages/Login';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sigea-sidebar-collapsed');
      if (saved !== null) return saved === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem('sigea-sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} isCollapsed={isCollapsed} />
      
      <div className={`main-content transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} ${sidebarOpen ? 'ml-0' : ''}`}>
        <Header setSidebarOpen={setSidebarOpen} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        
        <main className="p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/unidades-academicas" element={<UnidadesAcademicas />} />
            <Route path="/carreras" element={<Carreras />} />
            <Route path="/planes" element={<Planes />} />
            <Route path="/planes/:id/malla" element={<Malla />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/materias" element={<Materias />} />
            <Route path="/equivalencias" element={<Equivalencias />} />
            <Route path="/configuraciones" element={<Configuraciones />} />
            <Route path="/configuraciones/usuarios" element={<Usuarios />} />
            <Route path="/configuraciones/periodos" element={<Periodos />} />
            <Route path="/configuraciones/roles" element={<Roles />} />
            <Route path="/configuraciones/backup" element={<Backup />} />
            <Route path="/configuraciones/general" element={<ConfiguracionGeneral />} />
          </Routes>
        </main>
      </div>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
