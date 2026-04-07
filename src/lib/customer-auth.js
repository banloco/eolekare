// lib/customer-auth.js
const STORE_DOMAIN = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN
const CLIENT_ID = process.env.REACT_APP_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID
const AUTH_ENDPOINT = process.env.REACT_APP_SHOPIFY_CUSTOMER_ACCOUNT_AUTH_ENDPOINT
const TOKEN_ENDPOINT = process.env.REACT_APP_SHOPIFY_CUSTOMER_ACCOUNT_TOKEN_ENDPOINT
const LOGOUT_ENDPOINT = process.env.REACT_APP_SHOPIFY_CUSTOMER_ACCOUNT_LOGOUT_ENDPOINT
const API_VERSION = process.env.REACT_APP_SHOPIFY_API_VERSION

// URL de redirection après connexion
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

// GraphQL endpoint pour l'API Customer Account
const CUSTOMER_API_URL = `${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

// Fonction pour exécuter des requêtes authentifiées
async function customerFetch(query, variables = {}, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(CUSTOMER_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Customer API error: ${response.status} - ${text}`);
  }

  const { data, errors } = await response.json();
  if (errors) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data;
}

// ============ AUTHENTIFICATION CLIENT ============

// Rediriger vers la page de connexion Shopify
export function redirectToCustomerLogin() {
  const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=customer_read_customers%20customer_write_customers%20customer_read_orders`;
  window.location.href = authUrl;
}

// Rediriger vers la page d'inscription
export function redirectToCustomerSignup() {
  const signupUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&mode=signup`;
  window.location.href = signupUrl;
}

// Échanger le code contre un token d'accès
export async function exchangeCodeForToken(code) {
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
    return data;
  }
  throw new Error(data.error || 'Failed to exchange code for token');
}

// Récupérer le token stocké
export function getCustomerToken() {
  const token = localStorage.getItem('customer_token');
  const expiry = localStorage.getItem('customer_token_expiry');
  
  if (token && expiry && Date.now() < parseInt(expiry)) {
    return token;
  }
  return null;
}

// Vérifier si le client est connecté
export function isCustomerLoggedIn() {
  return !!getCustomerToken();
}

// Déconnexion locale
export function logoutCustomer() {
  localStorage.removeItem('customer_token');
  localStorage.removeItem('customer_token_expiry');
}

// Déconnexion complète avec redirection Shopify
export function redirectToCustomerLogout() {
  logoutCustomer();
  window.location.href = LOGOUT_ENDPOINT;
}

// ============ REQUÊTES CLIENT ============

// Récupérer les informations du client connecté
export async function getCurrentCustomer() {
  const token = getCustomerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const query = `query GetCurrentCustomer {
    customer {
      id
      firstName
      lastName
      email
      phone
      displayName
      acceptsMarketing
      createdAt
      defaultAddress {
        id
        address1
        address2
        city
        province
        country
        zip
        phone
      }
      addresses(first: 10) {
        edges {
          node {
            id
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
    }
  }`;

  const data = await customerFetch(query, {}, token);
  return data.customer;
}

// Récupérer les commandes du client
export async function getCustomerOrders() {
  const token = getCustomerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const query = `query GetCustomerOrders {
    customer {
      orders(first: 20) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  originalTotalPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }`;

  const data = await customerFetch(query, {}, token);
  return data.customer?.orders?.edges.map(edge => edge.node) || [];
}

// Mettre à jour le profil client
export async function updateCustomerProfile(input) {
  const token = getCustomerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const mutation = `mutation UpdateCustomer($input: CustomerUpdateInput!) {
    customerUpdate(input: $input) {
      customer {
        id
        firstName
        lastName
        email
        phone
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await customerFetch(mutation, { input }, token);
  if (data.customerUpdate?.userErrors?.length) {
    throw new Error(data.customerUpdate.userErrors[0].message);
  }
  return data.customerUpdate.customer;
}

// Ajouter une adresse
export async function addCustomerAddress(address) {
  const token = getCustomerToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const mutation = `mutation AddAddress($address: MailingAddressInput!) {
    customerAddressCreate(address: $address) {
      customerAddress {
        id
        address1
        city
        country
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await customerFetch(mutation, { address }, token);
  if (data.customerAddressCreate?.userErrors?.length) {
    throw new Error(data.customerAddressCreate.userErrors[0].message);
  }
  return data.customerAddressCreate.customerAddress;
}