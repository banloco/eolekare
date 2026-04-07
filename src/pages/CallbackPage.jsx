// pages/auth/CallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { exchangeCodeForToken } from '../../lib/customer-auth';

export default function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const error = params.get('error');

      if (error) {
        setError(error);
        setTimeout(() => navigate('/account/login'), 3000);
        return;
      }

      if (code) {
        try {
          await exchangeCodeForToken(code);
          navigate('/account');
        } catch (err) {
          setError(err.message);
          setTimeout(() => navigate('/account/login'), 3000);
        }
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return <div>Erreur: {error}. Redirection...</div>;
  }

  return <div>Authentification en cours...</div>;
}