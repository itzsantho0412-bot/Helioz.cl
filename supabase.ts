import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim()

export const isSupabaseConfigured: boolean = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null

export const adminEmail: string =
  ((import.meta.env.VITE_ADMIN_EMAIL as string | undefined)?.trim() || '').toLowerCase()

// Bucket name for product images.
export const STORAGE_BUCKET = 'product-images'

// SQL setup reminder (kept here so it's discoverable from the codebase).
// Run this in the Supabase SQL editor to bootstrap tables, policies and the
// storage bucket. See SETUP.md for a full walkthrough.
export const SETUP_SQL = `
-- 1. Products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price integer not null default 0,
  description text not null default '',
  category text not null default 'Ready-made',
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  stock integer not null default 0,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Public read
create policy "products_read_public"
  on public.products for select
  using (true);

-- Admin-only write
create policy "products_write_admin"
  on public.products for all
  using (
    exists (select 1 from public.admins a where a.id = auth.uid())
  )
  with check (
    exists (select 1 from public.admins a where a.id = auth.uid())
  );

-- 2. Admins table (whitelist of users allowed to manage products)
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create policy "admins_read_self"
  on public.admins for select
  using (auth.uid() = id);

-- 3. Storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_read_public"
  on storage.objects for select
  using (bucket_id = 'product-images');

create policy "product_images_write_admin"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admins a where a.id = auth.uid())
  )
  with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admins a where a.id = auth.uid())
  );
`
