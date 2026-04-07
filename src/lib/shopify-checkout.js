// lib/shopify-checkout.js
import { launchCheckout } from '@shopify/checkout-sheet-kit';

export async function startCheckout(cartItems) {
  // Construire l'URL de checkout
  const params = new URLSearchParams();
  cartItems.forEach(item => {
    params.append('items[][id]', item.shopify_variant_id);
    params.append('items[][quantity]', item.qty);
  });
  
  const checkoutUrl = `https://eolekare.myshopify.com/cart?${params.toString()}`;
  
  // Lancer le checkout sheet
  launchCheckout(checkoutUrl, {
    onComplete: () => {
      console.log('Paiement réussi !');
      // Vider le panier ici
    },
    onClose: () => {
      console.log('Checkout fermé');
    },
  });
}