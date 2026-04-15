import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const getCsrfToken = () => {
    const match = document.cookie.match(/csrftoken=([^;]+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    fetch('/api/csrf/', { credentials: 'include' });
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Campo obligatorio';
    if (!password.trim()) newErrors.password = 'Campo obligatorio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    try {
      await fetch('/api/csrf/', { credentials: 'include' });
      const csrfToken = getCsrfToken();

      const response = await fetch('/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({
          username,
          password,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        login({ username: data.username, is_admin: data.is_admin });
        toast.success('Bienvenido');
        navigate('/');
      } else {
        setErrorMessage(data.error || 'Error al iniciar sesión');
        setShowErrorModal(true);
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

const handleGoogleLogin = () => {
    window.location.href = '/google/oauth/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://media.licdn.com/dms/image/v2/D4D0BAQHfA7Zs3POWgw/company-logo_200_200/B4DZUeo4GqHkAI-/0/1739975787365/uncuyo_logo?e=2147483647&v=beta&t=24FA_QC0EJIVP2qbOZncNhopERjnBp5mPkPlBJJst1k" 
              alt="UNCuyo" 
              className="w-16 h-16 rounded-lg object-cover bg-white"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SIGeA</h1>
          <p className="text-gray-500 dark:text-gray-400">Sistema Integral de Gestión Académica</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
            Iniciar Sesión
          </h2>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Iniciar sesión con Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">o</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setErrors({...errors, username: ''}); }}
                className={`input ${errors.username ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Ingrese su usuario"
              />
              {errors.username && <p className="text-danger-500 text-sm mt-1">{errors.username}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }}
                className={`input ${errors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
                placeholder="Ingrese su contraseña"
              />
              {errors.password && <p className="text-danger-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          UNCuyo - Facultad de Ciencias Económicas
        </p>
      </div>

      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowErrorModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Error de Acceso</h3>
              <button onClick={() => setShowErrorModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{errorMessage}</p>
            <button 
              onClick={() => setShowErrorModal(false)}
              className="w-full btn btn-primary"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}