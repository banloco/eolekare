// src/contexts/CustomerAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerAuthContext = createContext(null);

// Fonctions utilitaires
function getCustomerToken() {
  const token = localStorage.getItem('customer_token');
  const expiry = localStorage.getItem('customer_token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token;
  }
  return null;
}

function logoutCustomer() {
  localStorage.removeItem('customer_token');
  localStorage.removeItem('customer_token_expiry');
}

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      const token = getCustomerToken();
      if (token) {
        // Pour l'instant, on simule un client connecté
        // Plus tard, vous pourrez faire un appel API pour récupérer les infos
        setCustomer({ token, isLoggedIn: true });
      }
      setLoading(false);
    };

    loadCustomer();
  }, []);

  const logout = () => {
    logoutCustomer();
    setCustomer(null);
  };

  const value = {
    customer,
    loading,
    logout,
    isLoggedIn: !!customer,
  };

  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error('useCustomerAuth must be used inside <CustomerAuthProvider>');
  }
  return ctx;
}