import { useState, createContext, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me/', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          localStorage.setItem('sigea_user', JSON.stringify(data));
          
          if (data.pending_approval) {
            toast.error('El usuario necesita aprobación de un administrador');
          }
        } else {
          setUser(null);
          localStorage.removeItem('sigea_user');
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('sigea_user', JSON.stringify(userData));
    
    if (userData.pending_approval) {
      toast.error('El usuario necesita aprobación de un administrador');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sigea_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}