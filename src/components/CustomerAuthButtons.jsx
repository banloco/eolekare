// components/CustomerAuthButtons.jsx
import React from 'react';
import { redirectToCustomerLogin, redirectToCustomerLogout } from '../lib/customer-auth';
import { useCustomerAuth } from '../contexts/CustomerAuthContext';

export default function CustomerAuthButtons() {
  const { customer, logout, isLoggedIn } = useCustomerAuth();

  if (isLoggedIn) {
    return (
      <div>
        <span>Bonjour, {customer?.firstName || customer?.email}</span>
        <button onClick={() => {
          logout();
          redirectToCustomerLogout();
        }}>
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={redirectToCustomerLogin}>Connexion</button>
    </div>
  );
}