// src/pages/auth/CallbackPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Configuration
const STORE_DOMAIN = 'https://eolekare.myshopify.com';
const CLIENT_ID = 'ef7d00a7-a0c2-49df-9deb-765f48329049';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;
const TOKEN_ENDPOINT = 'https://shopify.com/authentication/97484996903/oauth/token';

export default function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError(errorParam);
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      if (code) {
        try {
          // Échanger le code contre un token
          const response = await fetch(TOKEN_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              client_id: CLIENT_ID,
              code: code,
              redirect_uri: REDIRECT_URI,
              grant_type: 'authorization_code',
            }),
          });

          const data = await response.json();
          if (data.access_token) {
            localStorage.setItem('customer_token', data.access_token);
            if (data.expires_in) {
              localStorage.setItem('customer_token_expiry', Date.now() + (data.expires_in * 1000));
            }
            navigate('/');
          } else {
            throw new Error(data.error || 'Failed to authenticate');
          }
        } catch (err) {
          setError(err.message);
          setLoading(false);
          setTimeout(() => navigate('/'), 3000);
        }
      } else {
        setError('No authorization code received');
        setLoading(false);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Authentification en cours...</h2>
        <p>Veuillez patienter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Erreur d'authentification</h2>
        <p>{error}</p>
        <p>Redirection...</p>
      </div>
    );
  }

  return null;
}