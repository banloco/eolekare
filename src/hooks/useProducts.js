import { useState, useEffect } from 'react';
import { getProducts } from '../lib/supabase';

/** Hook — produits actifs depuis Supabase (vitrine) */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { products, loading, error };
}
