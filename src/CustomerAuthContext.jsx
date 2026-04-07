// contexts/CustomerAuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCustomerToken, getCurrentCustomer, logoutCustomer, isCustomerLoggedIn } from '../lib/customer-auth';

const CustomerAuthContext = createContext(null);

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomer = async () => {
      if (isCustomerLoggedIn()) {
        try {
          const customerData = await getCurrentCustomer();
          setCustomer(customerData);
        } catch (error) {
          console.error('Failed to load customer:', error);
          logoutCustomer();
        }
      }
      setLoading(false);
    };

    loadCustomer();
  }, []);

  const logout = () => {
    logoutCustomer();
    setCustomer(null);
  };

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, logout, isLoggedIn: !!customer }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error('useCustomerAuth must be used inside CustomerAuthProvider');
  return ctx;
}