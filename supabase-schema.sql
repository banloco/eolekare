-- ============================================================
-- EOLEKARE — Schema Supabase
-- Colle ce SQL dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── TABLE PRODUITS ──────────────────────────────────────────
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  category        text,
  tags            text[] default '{}',

  -- Prix
  price_fcfa      numeric(10,0),   -- Prix Bénin en FCFA
  price_eur       numeric(10,2),   -- Prix Europe en EUR

  -- Stock
  stock           integer default 0,
  active          boolean default true,

  -- Images (URLs Supabase Storage)
  images          text[] default '{}',

  -- Lien paiement Europe (Shopify, Stripe, etc.)
  checkout_url    text,

  -- Numéro WhatsApp Bénin (ex: 2290148654200)
  whatsapp        text default '2290148654200',

  -- Timestamps
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ── INDEX ────────────────────────────────────────────────────
create index if not exists products_active_idx  on public.products(active);
create index if not exists products_category_idx on public.products(category);

-- ── ROW LEVEL SECURITY ───────────────────────────────────────
alter table public.products enable row level security;

-- Lecture publique : uniquement les produits actifs
create policy "Vitrine — lecture publique" on public.products
  for select using (active = true);

-- Lecture admin : tous les produits (utilisateur authentifié admin)
create policy "Admin — lecture totale" on public.products
  for select using (auth.role() = 'authenticated');

-- Écriture admin uniquement
create policy "Admin — insert" on public.products
  for insert with check (auth.role() = 'authenticated');

create policy "Admin — update" on public.products
  for update using (auth.role() = 'authenticated');

create policy "Admin — delete" on public.products
  for delete using (auth.role() = 'authenticated');

-- ── STORAGE BUCKET ───────────────────────────────────────────
-- Crée le bucket "products" dans Storage → Public
insert into storage.buckets (id, name, public)
  values ('products', 'products', true)
  on conflict (id) do nothing;

-- Lecture publique des images
create policy "Images — lecture publique" on storage.objects
  for select using (bucket_id = 'products');

-- Upload admin uniquement
create policy "Images — upload admin" on storage.objects
  for insert with check (
    bucket_id = 'products' and auth.role() = 'authenticated'
  );

create policy "Images — delete admin" on storage.objects
  for delete using (
    bucket_id = 'products' and auth.role() = 'authenticated'
  );

-- ── TRIGGER updated_at ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── DONNÉES DE TEST (optionnel) ──────────────────────────────
-- Décommente pour insérer des produits de démonstration
/*
insert into public.products (name, description, category, tags, price_fcfa, price_eur, stock, active, checkout_url)
values
  ('Beurre Mangue',  'Beurre de mangue pur, huile de coco, vitamine E. Peau douce et lumineuse.',      'Corps',     array['naturel','mangue','corps'],  4000, 12.00, 50, true, 'https://eolekare.myshopify.com/cart/...'),
  ('Beurre Avocat',  'Avocat, karité et argan. Cheveux nourris, brillants et défrisés naturellement.', 'Capillaire', array['naturel','avocat','cheveux'], 4500, 14.00, 30, true, 'https://eolekare.myshopify.com/cart/...'),
  ('Beurre Coco',    'Coco, palme rouge et curcuma. Hydratation intense et éclat naturel.',            'Mixte',      array['naturel','coco','mixte'],    3500, 11.00, 45, true, 'https://eolekare.myshopify.com/cart/...');
*/
