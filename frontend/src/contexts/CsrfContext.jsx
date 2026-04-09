import { useState, useEffect, useCallback } from 'react';

export function useCsrf() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    const fetchCsrf = async () => {
      try {
        const response = await fetch('/api/auth/login/', {
          credentials: 'include',
        });
        const token = response.headers.get('X-CSRFToken');
        if (token) {
          setCsrfToken(token);
        }
      } catch (e) {
        console.error('Failed to fetch CSRF token');
      }
    };
    fetchCsrf();
  }, []);

  const csrfHeaders = useCallback(() => ({
    'X-CSRFToken': csrfToken,
  }), [csrfToken]);

  return { csrfToken, csrfHeaders };
}