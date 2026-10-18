# HELIOZ CLOTHING — Setup

A premium, minimalist T-shirt store front. Built with React, TypeScript, Tailwind,
Framer Motion and Supabase.

The site works out of the box in a **local demo mode** (products and images stored
in the browser) so you can preview and iterate immediately. When you're ready,
connect a real Supabase project to make everything persistent and admin-only.

---

## 1 · Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The admin area lives at `/admin`. In local mode, sign in with any email and
password — products you add will appear on the customer site immediately.

---

## 2 · Connect Supabase (recommended for production)

### 2.1  Create a project

Go to [supabase.com](https://supabase.com) and create a new project. Note the
**Project URL** and **anon public key** from *Project Settings → API*.

### 2.2  Configure environment

Copy `.env.example` to `.env` and fill in:

```bash
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY
VITE_ADMIN_EMAIL=you@example.com
```

`VITE_ADMIN_EMAIL` is the email that will be allowed to access `/admin`. Change
this to your real address.

### 2.3  Create the schema

In the Supabase dashboard, open **SQL Editor → New query** and paste the entire
contents of `src/lib/supabase.ts` → the `SETUP_SQL` constant. Run it.

It creates three things:

| Object | Purpose |
| --- | --- |
| `public.products` | Product table (name, price, sizes, colours, stock, images…) |
| `public.admins` | Whitelist of emails allowed to manage products |
| `storage.objects` (bucket `product-images`) | Public bucket for product images |

Row Level Security is enabled on all of them:

- **Public** users can `SELECT` from `products` and read images from the bucket.
- **Admin** users (rows in `admins`) can do anything.

### 2.4  Create your admin user

1. In Supabase go to **Authentication → Users → Add user → Create new user**.
   Use the email you put in `VITE_ADMIN_EMAIL`.
2. After the user exists, in **SQL Editor** run:

   ```sql
   insert into public.admins (id, email)
   values ('AUTH-USER-UUID-HERE', 'you@example.com');
   ```

   Replace the UUID with the user's UUID from the Auth dashboard.

### 2.5  Restart and test

```bash
npm run dev
```

You're now in real-database mode. Sign in at `/admin/login` with the email and
password you created above.

---

## 3 · Project structure

```
src/
├── App.tsx              router
├── main.tsx             entry
├── index.css            design tokens (Tailwind v4 theme)
├── lib/
│   ├── supabase.ts      client + setup SQL
│   ├── useProducts.ts   fetch / create / update / delete + image upload
│   ├── useAdminAuth.ts  sign-in / session / admin whitelist check
│   ├── whatsapp.ts      owner's number and message formatters
│   └── types.ts         shared TS types
├── components/          Layout, Header, Footer, ProductCard, OrderModal, …
└── pages/               Home, Shop, ProductDetail, CustomOrders, Contact, Admin…
public/
├── favicon.svg
└── placeholder.svg
```

---

## 4 · How ordering works

1. Customer picks size, colour and quantity on a product page.
2. Tapping **Buy Now** opens an order summary modal.
3. Tapping **Confirm on WhatsApp** plays a brief preparing animation and opens
   WhatsApp to **+91 63794 07292** with the order details prefilled.
4. The customer manually taps *send* on WhatsApp. Until the owner replies,
   the site treats this as a **request**, not a confirmed order — no stock is
   decremented, and the modal's final state says
   *"Opening WhatsApp to complete your order."*

Custom inquiries use the same pattern via `/custom`.

---

## 5 · Deployment

This project includes a `vercel.json` that rewrites all routes to `/index.html`
so client-side routing works on a static host. Deploy with:

```bash
npm run build
vercel deploy
```

Don't forget to set the same `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and
`VITE_ADMIN_EMAIL` in your hosting provider's environment settings.
