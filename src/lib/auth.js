// lib/auth.js
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'shopify_auth_token',
  USER_DATA: 'shopify_user_data',
  SESSION_EXPIRY: 'shopify_session_expiry',
};

const SESSION_DURATION = 24 * 60 * 60 * 1000;

// Configuration depuis .env (React)
const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD;

async function verifyCredentials(email, password) {
  // Vérification simple pour développement
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    return {
      success: true,
      user: {
        id: 'admin-1',
        email: ADMIN_EMAIL,
        role: 'admin',
        name: 'Administrateur',
      },
    };
  }
  
  return { success: false };
}

function createSession(user) {
  const token = btoa(JSON.stringify({
    userId: user.id,
    email: user.email,
    timestamp: Date.now(),
  }));
  
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  localStorage.setItem(STORAGE_KEYS.SESSION_EXPIRY, (Date.now() + SESSION_DURATION).toString());
  
  return { token, user };
}

function getValidSession() {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  const expiry = localStorage.getItem(STORAGE_KEYS.SESSION_EXPIRY);
  
  if (!token || !userData || !expiry) {
    return null;
  }
  
  if (Date.now() > parseInt(expiry)) {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    return null;
  }
  
  return {
    token,
    user: JSON.parse(userData),
  };
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getValidSession();
    if (session) {
      setUser(session.user);
    }
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email, password) => {
    const result = await verifyCredentials(email, password);
    
    if (!result.success) {
      throw new Error('Email ou mot de passe incorrect');
    }
    
    createSession(result.user);
    setUser(result.user);
    
    return result.user;
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SESSION_EXPIRY);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}