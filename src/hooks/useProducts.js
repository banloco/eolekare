import { useState, useEffect } from 'react';
import { getProducts } from '../lib/api';

/** Hook — produits actifs depuis l'API Laravel (vitrine)
 *  @param {string|null} market  'benin' | 'international' | null
 */
export function useProducts(market = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts(market)
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [market]);

  return { products, loading, error };
}
