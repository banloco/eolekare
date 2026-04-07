const STORE_DOMAIN = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN
const ACCESS_TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_TOKEN;
const ADMIN_TOKEN = process.env.REACT_APP_SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.REACT_APP_SHOPIFY_API_VERSION

async function shopifyFetch(query, variables = {}, useAdmin = false) {
  const url = `${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (useAdmin) {
    headers['X-Shopify-Access-Token'] = ADMIN_TOKEN;
  } else {
    headers['X-Shopify-Storefront-Access-Token'] = ACCESS_TOKEN;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error: ${response.status} - ${text}`);
  }

  const { data, errors } = await response.json();
  if (errors) {
    throw new Error(errors.map(e => e.message).join(', '));
  }
  return data;
}

// ============ FONCTIONS POUR LE STOREFRONT ============

export async function testConnection() {
  const query = `{ shop { name } }`;
  return shopifyFetch(query);
}

export async function getAllProducts() {
  const query = `query GetAllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          productType
          tags
          availableForSale
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
        }
      }
    }
  }`;

  const data = await shopifyFetch(query, { first: 250 });
  
  if (!data || !data.products) {
    return [];
  }
  
  return data.products.edges.map(({ node }) => {
    const variant = node.variants?.edges[0]?.node;
    return {
      id: node.id,
      shopify_variant_id: variant?.id || node.id,  // ← AJOUTÉ
      name: node.title,
      handle: node.handle,
      description: node.descriptionHtml,
      category: node.productType,
      tags: node.tags,
      active: node.availableForSale,
      stock: variant?.quantityAvailable || 0,
      price: variant?.price?.amount || 0,
      price_eur: variant?.price?.amount || 0,
      images: node.images?.edges.map(img => img.node.url) || [],
    };
  });
}

export async function getProducts() {
  return getAllProducts();
}

export async function getProduct(id) {
  const query = `query GetProduct($id: ID!) {
    node(id: $id) {
      ... on Product {
        id
        title
        handle
        descriptionHtml
        productType
        tags
        availableForSale
        variants(first: 250) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
              quantityAvailable
            }
          }
        }
        images(first: 10) {
          edges {
            node {
              id
              url
              altText
            }
          }
        }
      }
    }
  }`;

  const data = await shopifyFetch(query, { id });
  if (!data || !data.node) return null;
  
  const node = data.node;
  const totalStock = node.variants?.edges.reduce((sum, { node: v }) => sum + (v.quantityAvailable || 0), 0) || 0;
  const firstVariant = node.variants?.edges[0]?.node;
  
  return {
    id: node.id,
    shopify_variant_id: firstVariant?.id || node.id,  // ← AJOUTÉ
    name: node.title,
    handle: node.handle,
    description: node.descriptionHtml,
    category: node.productType,
    tags: node.tags,
    active: node.availableForSale,
    stock: totalStock,
    price: firstVariant?.price?.amount || 0,
    price_eur: firstVariant?.price?.amount || 0,
    images: node.images?.edges.map(img => img.node.url) || [],
    variants: node.variants?.edges.map(({ node: v }) => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price.amount),
      available: v.availableForSale,
      quantity: v.quantityAvailable || 0,
    })) || [],
  };
}

export async function getProductByHandle(handle) {
  const query = `query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id
      title
      handle
      descriptionHtml
      productType
      tags
      availableForSale
      variants(first: 250) {
        edges {
          node {
            id
            title
            price {
              amount
              currencyCode
            }
            availableForSale
            quantityAvailable
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
    }
  }`;

  const data = await shopifyFetch(query, { handle });
  if (!data || !data.productByHandle) return null;
  
  const node = data.productByHandle;
  const totalStock = node.variants?.edges.reduce((sum, { node: v }) => sum + (v.quantityAvailable || 0), 0) || 0;
  const firstVariant = node.variants?.edges[0]?.node;
  
  return {
    id: node.id,
    shopify_variant_id: firstVariant?.id || node.id,  // ← AJOUTÉ
    name: node.title,
    handle: node.handle,
    description: node.descriptionHtml,
    category: node.productType,
    tags: node.tags,
    active: node.availableForSale,
    stock: totalStock,
    price: firstVariant?.price?.amount || 0,
    price_eur: firstVariant?.price?.amount || 0,
    images: node.images?.edges.map(img => img.node.url) || [],
    variants: node.variants?.edges.map(({ node: v }) => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price.amount),
      available: v.availableForSale,
      quantity: v.quantityAvailable || 0,
    })) || [],
  };
}

// ============ FONCTIONS ADMIN (API Admin) ============

export async function createProduct(productData) {
  const mutation = `mutation ProductCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
        status
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await shopifyFetch(mutation, {
    input: {
      title: productData.name,
      descriptionHtml: productData.description || '',
      productType: productData.category || '',
      tags: productData.tags?.join(', ') || '',
      status: productData.active ? 'ACTIVE' : 'DRAFT',
      variants: [{
        price: (productData.price_eur || 0).toString(),
        inventoryQuantity: productData.stock || 0,
      }],
    },
  }, true);

  if (data.productCreate?.userErrors?.length) {
    throw new Error(data.productCreate.userErrors[0].message);
  }
  return data.productCreate.product;
}

export async function updateProduct(id, productData) {
  const mutation = `mutation ProductUpdate($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
        handle
        status
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await shopifyFetch(mutation, {
    input: {
      id: id,
      title: productData.name,
      descriptionHtml: productData.description,
      productType: productData.category,
      tags: productData.tags?.join(', '),
      status: productData.active ? 'ACTIVE' : 'DRAFT',
    },
  }, true);

  if (data.productUpdate?.userErrors?.length) {
    throw new Error(data.productUpdate.userErrors[0].message);
  }
  return data.productUpdate.product;
}

export async function deleteProduct(id) {
  const mutation = `mutation ProductDelete($id: ID!) {
    productDelete(input: { id: $id }) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await shopifyFetch(mutation, { id }, true);
  
  if (data.productDelete?.userErrors?.length) {
    throw new Error(data.productDelete.userErrors[0].message);
  }
  return data.productDelete.deletedProductId;
}

export async function uploadImage(productId, imageUrl) {
  const mutation = `mutation ProductImageCreate($productId: ID!, $image: ImageInput!) {
    productImageCreate(productId: $productId, image: $image) {
      image {
        id
        url
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await shopifyFetch(mutation, {
    productId,
    image: { src: imageUrl },
  }, true);

  if (data.productImageCreate?.userErrors?.length) {
    throw new Error(data.productImageCreate.userErrors[0].message);
  }
  return data.productImageCreate.image;
}

export async function deleteImage(imageId) {
  const mutation = `mutation ProductImageDelete($imageId: ID!) {
    productImageDelete(input: { id: $imageId }) {
      deletedImageId
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await shopifyFetch(mutation, { imageId }, true);
  
  if (data.productImageDelete?.userErrors?.length) {
    throw new Error(data.productImageDelete.userErrors[0].message);
  }
  return data.productImageDelete.deletedImageId;
}

// ============ FONCTIONS PANIER ============

export async function createCart() {
  const mutation = `mutation {
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
  }`;

  const data = await shopifyFetch(mutation);
  if (data.cartCreate?.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }
  return data.cartCreate.cart;
}

export async function addToCart(cartId, variantId, quantity = 1) {
  const mutation = `mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        id
        totalQuantity
      }
      userErrors {
        field
        message
      }
    }
  }`;

  const data = await shopifyFetch(mutation, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });

  if (data.cartLinesAdd?.userErrors?.length) {
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }
  return data.cartLinesAdd.cart;
}