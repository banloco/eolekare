import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { signIn as apiSignIn, signOut as apiSignOut, getSession } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then(session => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
  }, []);

  const signIn = useCallback(async (email, password) => {
    const data = await apiSignIn(email, password);
    setUser(data.user ?? { email });
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isAdmin: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
