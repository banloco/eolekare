// src/components/CheckoutModal.jsx
import React, { useState, useEffect, useCallback } from 'react';

const STORE_DOMAIN = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || 'https://eolekare.myshopify.com';
const ACCESS_TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN;

export function CheckoutModal({ isOpen, onClose, cartItems, onSuccess }) {
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createCheckout = useCallback(async () => {
    if (!cartItems || cartItems.length === 0) return;
    
    setLoading(true);
    setError(null);

    try {
      // 1. Créer un nouveau panier
      const cartMutation = `
        mutation {
          cartCreate {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const cartResponse = await fetch(`${STORE_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: cartMutation }),
      });

      const cartResult = await cartResponse.json();
      console.log('Cart creation response:', cartResult);
      
      if (cartResult.errors) {
        throw new Error(cartResult.errors[0].message);
      }
      
      if (cartResult.data?.cartCreate?.userErrors?.length) {
        throw new Error(cartResult.data.cartCreate.userErrors[0].message);
      }

      if (!cartResult.data?.cartCreate?.cart) {
        throw new Error('Impossible de créer le panier');
      }

      const cartId = cartResult.data.cartCreate.cart.id;
      let checkoutUrlTemp = cartResult.data.cartCreate.cart.checkoutUrl;

      // 2. Ajouter les articles au panier
      const lineItems = cartItems.map(item => ({
        merchandiseId: item.shopify_variant_id,
        quantity: item.qty,
      }));

      const addMutation = `
        mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart {
              id
              checkoutUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      const addResponse = await fetch(`${STORE_DOMAIN}/api/2024-01/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': ACCESS_TOKEN,
        },
        body: JSON.stringify({
          query: addMutation,
          variables: { cartId, lines: lineItems },
        }),
      });

      const addResult = await addResponse.json();
      console.log('Add to cart response:', addResult);

      if (addResult.errors) {
        throw new Error(addResult.errors[0].message);
      }

      if (addResult.data?.cartLinesAdd?.userErrors?.length) {
        throw new Error(addResult.data.cartLinesAdd.userErrors[0].message);
      }

      if (addResult.data?.cartLinesAdd?.cart?.checkoutUrl) {
        checkoutUrlTemp = addResult.data.cartLinesAdd.cart.checkoutUrl;
      }

      setCheckoutUrl(checkoutUrlTemp);
    } catch (err) {
      console.error('Checkout creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      createCheckout();
    }
  }, [isOpen, cartItems, createCheckout]);

  // Fallback: utiliser l'URL directe si l'API échoue
  const getFallbackUrl = () => {
    const validItems = cartItems.filter(i => i.shopify_variant_id && i.qty > 0);
    if (validItems.length === 0) return '#';
    
    const params = new URLSearchParams();
    validItems.forEach(item => {
      params.append('items[][id]', item.shopify_variant_id);
      params.append('items[][quantity]', item.qty);
    });
    
    return `${STORE_DOMAIN}/cart?${params.toString()}`;
  };

  const handleRetry = () => {
    if (error) {
      // Utiliser l'URL de fallback directe
      const fallbackUrl = getFallbackUrl();
      if (fallbackUrl !== '#') {
        window.open(fallbackUrl, '_blank');
        onClose();
      } else {
        createCheckout();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        position: 'relative',
        width: '95%',
        maxWidth: 900,
        height: '90%',
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fff',
          flexShrink: 0,
        }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: '"Cormorant Garamond", serif', fontSize: 20, color: '#3b190f' }}>
              Paiement sécurisé
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: 10, color: '#7a4f2d', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Shopify Secure Checkout
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
              padding: '0 8px',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
            onMouseLeave={e => e.currentTarget.style.color = '#666'}
          >
            ✕
          </button>
        </div>

        {/* Contenu */}
        <div style={{ flex: 1, position: 'relative', background: '#fafafa' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              zIndex: 10,
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  border: '3px solid #f8cb78',
                  borderTopColor: '#3b190f',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem',
                }} />
                <p style={{ color: '#7a4f2d', fontSize: 12 }}>Préparation du paiement...</p>
                <style>{`
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              zIndex: 10,
            }}>
              <div style={{ textAlign: 'center', color: '#c0392b', padding: '2rem', maxWidth: 400 }}>
                <div style={{ fontSize: 48, marginBottom: '1rem' }}>⚠️</div>
                <p style={{ fontSize: 14, marginBottom: '1rem', fontWeight: 500 }}>Une erreur est survenue</p>
                <p style={{ fontSize: 12, marginBottom: '1.5rem', color: '#666' }}>{error}</p>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '10px 24px',
                    background: '#3b190f',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 10,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#5a2d12'}
                  onMouseLeave={e => e.currentTarget.style.background = '#3b190f'}
                >
                  Ouvrir le paiement dans un nouvel onglet
                </button>
              </div>
            </div>
          )}

          {checkoutUrl && !loading && !error && (
            <iframe
              src={checkoutUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Shopify Checkout"
              allow="payment *"
            />
          )}
        </div>

        {/* Footer sécurisé */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid #e5e5e5',
          backgroundColor: '#f9f9f9',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <span style={{ fontSize: 11, color: '#7a4f2d' }}>🔒 Paiement 100% sécurisé</span>
          <span style={{ fontSize: 9, color: '#999' }}>•</span>
          <span style={{ fontSize: 11, color: '#7a4f2d' }}>💳 Toutes les cartes acceptées</span>
        </div>
      </div>
    </div>
  );
}