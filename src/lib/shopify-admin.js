// lib/shopify-admin.js
const STORE_DOMAIN = import.meta.env.REACT_SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = import.meta.env.REACT_SHOPIFY_ADMIN_TOKEN;
const API_VERSION = import.meta.env.REACT_SHOPIFY_ADMIN_API_VERSION;

async function adminFetch(query, variables = {}) {
  const response = await fetch(`${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify Admin API error: ${response.status}`);
  }

  const { data, errors } = await response.json();
  if (errors) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data;
}

// Vérifier les identifiants admin (via Staff)
export async function verifyAdminCredentials(email, password) {
  // Note: Shopify n'a pas d'endpoint direct pour vérifier les identifiants staff via API
  // Solution alternative : utiliser un webhook personnalisé ou stocker les admins dans un fichier .env
  
  // Option 1: Utiliser une variable d'environnement pour l'admin
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
  const ADMIN_PASSWORD_HASH = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
  
  // Simple vérification (à sécuriser)
  if (email === ADMIN_EMAIL) {
    // Idéalement, utilisez bcrypt côté backend
    return { success: email === ADMIN_EMAIL };
  }
  
  return { success: false };
}

// Récupérer la liste des staff (nécessite permissions élevées)
export async function getStaffMembers() {
  const query = `
    query GetStaffMembers {
      staffMembers(first: 50) {
        edges {
          node {
            id
            email
            firstName
            lastName
            role
          }
        }
      }
    }
  `;
  
  const data = await adminFetch(query);
  return data.staffMembers.edges.map(edge => edge.node);
}