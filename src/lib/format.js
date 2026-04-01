export function formatFCFA(amount) {
  if (!amount && amount !== 0) return '—';
  return `${Math.round(Number(amount)).toLocaleString('fr-FR')} FCFA`;
}

export function formatEUR(amount) {
  if (!amount && amount !== 0) return '—';
  return new Intl.NumberFormat('fr-FR', { style:'currency', currency:'EUR' }).format(Number(amount));
}

export function formatStock(qty) {
  if (qty === null || qty === undefined) return '—';
  if (qty === 0) return 'Épuisé';
  if (qty <= 5) return `${qty} restants`;
  return `${qty} en stock`;
}
