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
        login({ username: data.username });
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