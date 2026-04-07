// lib/format.js
export function formatEUR(amount) {
  if (amount === null || amount === undefined) return '— €';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatFCFA(amount) {
  if (amount === null || amount === undefined) return '— FCFA';
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}