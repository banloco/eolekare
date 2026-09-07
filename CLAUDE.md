# Eolekare — Frontend

Frontend React du site e-commerce Eolekare (produits mangue/avocat), deux vitrines : Bénin (FCFA) et Europe/International (EUR). Site public : https://eolekare.com. Consomme l'API Laravel du dossier séparé `../eolekare-project/backend/` (voir son CLAUDE.md pour le backend, la BDD et la sécurité API).

## Stack

- React 18 + Vite, React Router v6
- Tailwind CSS
- Paiements côté client : `@paypal/react-paypal-js` (Europe), FedaPay/Stripe déclenchés via l'API backend
- Feed Instagram via Behold.so (`@behold/react`)
- Pas de state manager global : `AuthContext` + `LangContext` (i18n FR/EN) via Context API, panier en `localStorage`

## Dépôt & déploiement

- Dépôt Git : `git@github.com:banloco/eolekare.git`, branche `main`, poussé directement (pas de PR visibles dans l'historique récent)
- Déployé sur **Vercel** (`vercel.json` gère le rewrite SPA `/(.*) → /index.html`)
- Un `netlify.toml` traîne encore dans le repo — reliquat d'un hébergement Netlify antérieur, plus utilisé activement (à confirmer avant de le supprimer)

## Structure

```
src/
  pages/            # BeninPage, EuropePage, CheckoutPage, AboutPage, ContactPage, LegalPage, RegionSelector...
  pages/admin/       # back-office : Dashboard, Orders, Products, Users, Expenses, Login
  components/        # UI partagée (CartDrawer, RelayPicker, StorySection, HowToSection...)
  components/admin/  # AdminLayout, ProtectedRoute
  context/           # AuthContext, LangContext
  lib/api.js         # client HTTP unique vers l'API (fetch + retry + timeout 15s), lit VITE_API_URL
  lib/format.js
  hooks/             # useProducts, useSEO
```

## Variables d'environnement (`.env`, non versionné)

- `VITE_API_URL` — URL de l'API (prod : `https://api.eolekare.com/api`)
- `VITE_WHATSAPP_NUMBER` — numéro pour le message WhatsApp pré-rempli (checkout Bénin)
- `VITE_BEHOLD_FEED_ID` — feed Instagram
- `VITE_PAYPAL_CLIENT_ID` — PayPal (Europe)

Aucun secret sensible côté frontend (normal pour du Vite/client-side) — toutes les clés secrètes de paiement vivent côté backend.

## Commandes utiles

```bash
npm install
npm run dev       # Vite dev server
npm run build
npm run lint
```

## Points de vigilance

- Toujours garder `lib/api.js` comme unique point d'entrée HTTP (gère déjà retry/timeout/auth token) plutôt que d'appeler `fetch` ailleurs.
- Le rôle admin (`super_admin`/`admin`/`readonly`) est appliqué côté backend ; `ProtectedRoute`/`AdminLayout` ne fait que la garde de navigation côté client, pas la source de vérité des droits. Le token Sanctum est stocké en `localStorage` (`auth_token`) — vulnérable en cas de XSS futur, à garder en tête avant d'ajouter un script tiers ou du HTML non échappé (`dangerouslySetInnerHTML`) côté admin.
- Voir `../eolekare-project/FEATURES.md` pour l'état d'avancement fonctionnel à jour (V1 vs V2) avant d'ajouter une fonctionnalité, pour éviter de dupliquer du travail déjà prévu en V2.
- `BeninPage.jsx`/`EuropePage.jsx` : `SHOW_LOW_STOCK_BADGES` (const en tête de fichier) masque le badge "Plus que X en stock" côté visiteurs depuis le lancement (2026-09) — repasser à `true` sur demande explicite de l'utilisateur, pas par défaut.
- Les champs téléphone (`type="tel"`) doivent garder `autoComplete="tel"` — sans ça l'autofill navigateur ne remplit que le numéro national, sans indicatif, ce qui fait échouer la validation FedaPay côté serveur.
- `RelayPicker`/`CheckoutPage` : `relay.Adresse1` doit être transmis (`relay_address`) en plus du nom à la création de commande — sans ça, le mail récap admin n'a pas de quoi rechercher le point relais sur le compte pro Mondial Relay (qui ne recherche que par adresse, pas par nom).
