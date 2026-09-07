# Eolekare — Frontend

Frontend React du site e-commerce [Eolekare](https://eolekare.com) — beurres de mangue, avocat et coco 100% naturels, fabriqués au Bénin. Deux vitrines : Bénin (FCFA) et Europe/International (EUR).

Consomme l'API Laravel du dépôt séparé [`banloco/eolekare-project`](https://github.com/banloco/eolekare-project).

## Stack

- React 18 + Vite, React Router v6, Tailwind CSS
- Paiements côté client : PayPal (Europe, prévu), FedaPay/Stripe déclenchés via l'API backend
- Feed Instagram via Behold.so
- Pas de state manager global : `AuthContext` + `LangContext` (i18n FR/EN), panier en `localStorage`

## Documentation

Voir `CLAUDE.md` pour le guide complet (structure, variables d'environnement, conventions).

## Démarrage local

```bash
npm install
npm run dev       # Vite dev server
npm run build
npm run lint
```

## Déploiement

Déployé sur Vercel (`vercel.json`), auto-deploy sur push vers `main`.

## License

Propriétaire — tous droits réservés.
