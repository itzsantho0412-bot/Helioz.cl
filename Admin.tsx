import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Pencil, Plus, Trash2, Upload, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminAuth } from '../lib/useAdminAuth'
import { isSupabaseConfigured } from '../lib/supabase'
import {
  createProduct,
  deleteProduct,
  newId,
  updateProduct,
  uploadProductImage,
  useProducts,
} from '../lib/useProducts'
import type { Product, ProductCategory } from '../lib/types'
import PlaceholderImage from '../components/PlaceholderImage'

const CATEGORIES: ProductCategory[] = ['Ready-made', 'Custom Print', 'Essentials']

interface DraftImage {
  url: string
  uploading: boolean
}

export default function Admin() {
  const { session, signOut } = useAdminAuth()
  const { products, refresh, loading } = useProducts()
  const [editing, setEditing] = useState<Product | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function flash(msg: string) {
    setNotice(msg)
    window.setTimeout(() => setNotice(null), 2400)
  }

  return (
    <section className="mx-auto max-w-6xl px-6 md:px-10 pt-10 md:pt-14 pb-24">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
          >
            <ArrowLeft size={14} /> Back to site
          </Link>
          <h1 className="mt-4 font-display text-4xl md:text-5xl tracking-tight text-[var(--color-charcoal)]">
            Admin
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
            {session?.email}
            <span className="ml-2 text-[var(--color-muted)]/80">
              · {isSupabaseConfigured ? 'Supabase' : 'Local demo mode'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-2 bg-[var(--color-charcoal)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[var(--color-offwhite)] hover:opacity-90"
          >
            <Plus size={14} /> Add product
          </button>
          <button
            onClick={signOut}
            className="border border-[var(--color-beige)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
          >
            Sign out
          </button>
        </div>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-8 inline-flex items-center gap-2 border border-[var(--color-beige)] bg-[var(--color-offwhite)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--color-charcoal)]"
          >
            <Check size={14} /> {notice}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-12">
        {loading ? (
          <Skeleton />
        ) : products.length === 0 ? (
          <EmptyState onAdd={() => setCreating(true)} />
        ) : (
          <ul className="divide-y divide-[var(--color-beige)] border-t border-b border-[var(--color-beige)]">
            {products.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-5 py-5"
              >
                <div className="w-16 h-20 bg-[var(--color-beige)] overflow-hidden shrink-0">
                  <PlaceholderImage src={p.image_urls?.[0] || null} alt={p.name} aspect="portrait" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display text-xl text-[var(--color-charcoal)] truncate">{p.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    {p.category} · ₹{p.price.toLocaleString('en-IN')} · {p.stock} in stock
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(p)}
                    aria-label={`Edit ${p.name}`}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(p)}
                    aria-label={`Delete ${p.name}`}
                    className="p-2 text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {(creating || editing) && (
          <ProductForm
            initial={editing}
            onClose={() => {
              setCreating(false)
              setEditing(null)
            }}
            onSaved={(msg) => {
              setCreating(false)
              setEditing(null)
              refresh()
              flash(msg)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmDelete && (
          <ConfirmDelete
            product={confirmDelete}
            onClose={() => setConfirmDelete(null)}
            onDeleted={() => {
              setConfirmDelete(null)
              refresh()
              flash('Product removed')
            }}
          />
        )}
      </AnimatePresence>
    </section>
  )
}

/* ============================================================== */
/*  Product form (create + edit)                                   */
/* ============================================================== */
function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Product | null
  onClose: () => void
  onSaved: (msg: string) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [price, setPrice] = useState<number>(initial?.price ?? 0)
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState<ProductCategory>(initial?.category ?? 'Ready-made')
  const [sizesRaw, setSizesRaw] = useState((initial?.sizes ?? ['S', 'M', 'L', 'XL']).join(', '))
  const [colorsRaw, setColorsRaw] = useState((initial?.colors ?? ['Off-white', 'Charcoal']).join(', '))
  const [stock, setStock] = useState<number>(initial?.stock ?? 0)
  const [images, setImages] = useState<DraftImage[]>(
    (initial?.image_urls ?? []).map((url) => ({ url, uploading: false })),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function parseList(raw: string): string[] {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return
    const list = Array.from(files)
    for (const file of list) {
      const tempId = newId()
      // Optimistic local preview.
      const previewUrl = URL.createObjectURL(file)
      setImages((prev) => [...prev, { url: previewUrl, uploading: true }])
      try {
        const url = await uploadProductImage(file)
        // Replace the preview with the real URL.
        setImages((prev) =>
          prev.map((img) => (img.url === previewUrl ? { url, uploading: false } : img)),
        )
        URL.revokeObjectURL(previewUrl)
      } catch (e) {
        setImages((prev) => prev.filter((img) => img.url !== previewUrl))
        URL.revokeObjectURL(previewUrl)
        setError(e instanceof Error ? e.message : 'Could not upload image')
      }
      // Reference tempId to keep it referenced (silences unused warning).
      void tempId
    }
  }

  function removeImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    setError(null)
    if (!name.trim()) {
      setError('Please give the product a name.')
      return
    }
    if (price < 0) {
      setError('Price cannot be negative.')
      return
    }
    if (stock < 0) {
      setError('Stock cannot be negative.')
      return
    }
    if (images.some((img) => img.uploading)) {
      setError('Please wait for images to finish uploading.')
      return
    }

    const payload: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
      name: name.trim(),
      price,
      description: description.trim(),
      category,
      sizes: parseList(sizesRaw),
      colors: parseList(colorsRaw),
      stock,
      image_urls: images.map((i) => i.url).filter(Boolean),
    }

    setSaving(true)
    try {
      if (initial) {
        await updateProduct(initial.id, payload)
        onSaved('Product updated')
      } else {
        await createProduct(payload)
        onSaved('Product added')
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">
            {initial ? 'Edit' : 'New'} product
          </p>
          <h2 className="mt-2 font-display text-3xl text-[var(--color-charcoal)]">
            {initial ? initial.name : 'Add a piece'}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Close"
          className="p-2 text-[var(--color-muted)] hover:text-[var(--color-charcoal)]"
        >
          <X size={18} />
        </button>
      </header>

      <form onSubmit={onSubmit} className="mt-7 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        {/* Images */}
        <Block label="Images">
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div
                key={i}
                className="relative w-20 h-24 bg-[var(--color-beige)] overflow-hidden"
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {img.uploading && (
                  <div className="absolute inset-0 bg-[var(--color-offwhite)]/70 flex items-center justify-center text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Uploading
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 bg-[var(--color-offwhite)] text-[var(--color-charcoal)] hover:text-[var(--color-muted)]"
                  aria-label="Remove image"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-20 h-24 border border-dashed border-[var(--color-muted)]/40 flex flex-col items-center justify-center gap-1 text-[var(--color-muted)] hover:border-[var(--color-charcoal)] hover:text-[var(--color-charcoal)]"
            >
              <Upload size={16} />
              <span className="text-[10px] uppercase tracking-[0.18em]">Add</span>
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files)
              e.target.value = ''
            }}
          />
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
            The first image is used as the cover.
          </p>
        </Block>

        <Block label="Name">
          <Input value={name} onChange={setName} placeholder="e.g. Heavyweight Tee — Off-white" />
        </Block>

        <div className="grid sm:grid-cols-2 gap-6">
          <Block label="Price (₹)">
            <Input
              type="number"
              value={String(price)}
              onChange={(v) => setPrice(Math.max(0, Number(v) || 0))}
              min={0}
            />
          </Block>
          <Block label="Stock">
            <Input
              type="number"
              value={String(stock)}
              onChange={(v) => setStock(Math.max(0, Number(v) || 0))}
              min={0}
            />
          </Block>
        </div>

        <Block label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const active = category === c
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`px-3.5 py-2 text-[11px] uppercase tracking-[0.2em] border ${
                    active
                      ? 'border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-offwhite)]'
                      : 'border-[var(--color-beige)] text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </Block>

        <Block label="Description">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--color-beige)] focus:border-[var(--color-charcoal)] py-3 outline-none text-sm"
            placeholder="A short, considered description."
          />
        </Block>

        <div className="grid sm:grid-cols-2 gap-6">
          <Block label="Sizes (comma-separated)">
            <Input value={sizesRaw} onChange={setSizesRaw} placeholder="S, M, L, XL" />
          </Block>
          <Block label="Colours (comma-separated)">
            <Input value={colorsRaw} onChange={setColorsRaw} placeholder="Off-white, Charcoal, Beige" />
          </Block>
        </div>

        {error && (
          <p className="text-xs text-[var(--color-charcoal)] border-l-2 border-[var(--color-charcoal)] pl-3">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-[var(--color-beige)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-charcoal)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-offwhite)] hover:opacity-90 disabled:opacity-60"
          >
            {saving ? 'Saving…' : initial ? 'Save changes' : 'Add product'}
            {!saving && <ArrowRight size={14} />}
          </button>
        </div>
      </form>
    </Modal>
  )
}

/* ============================================================== */
/*  Confirm delete                                                 */
/* ============================================================== */
function ConfirmDelete({
  product,
  onClose,
  onDeleted,
}: {
  product: Product
  onClose: () => void
  onDeleted: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onConfirm() {
    setBusy(true)
    setError(null)
    try {
      await deleteProduct(product.id)
      onDeleted()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not delete')
      setBusy(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">Confirm</p>
      <h2 className="mt-2 font-display text-3xl text-[var(--color-charcoal)]">Delete this piece?</h2>
      <p className="mt-3 text-sm text-[var(--color-muted)]">
        <span className="text-[var(--color-charcoal)]">{product.name}</span> will be removed from
        the store. This can&rsquo;t be undone.
      </p>
      {error && (
        <p className="mt-3 text-xs text-[var(--color-charcoal)] border-l-2 border-[var(--color-charcoal)] pl-3">
          {error}
        </p>
      )}
      <div className="mt-7 flex flex-col-reverse sm:flex-row gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-[var(--color-beige)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)] hover:text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-[var(--color-charcoal)] px-5 py-3.5 text-xs uppercase tracking-[0.18em] text-[var(--color-offwhite)] hover:opacity-90 disabled:opacity-60"
        >
          {busy ? 'Removing…' : 'Delete'}
        </button>
      </div>
    </Modal>
  )
}

/* ============================================================== */
/*  Pieces                                                         */
/* ============================================================== */
function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="absolute inset-0 bg-[var(--color-charcoal)]/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 220, damping: 28 }}
        className="relative w-full max-w-2xl bg-[var(--color-offwhite)] border border-[var(--color-beige)] p-7 md:p-9 max-h-[90vh] overflow-y-auto"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.22em] text-[var(--color-muted)]">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  )
}

function Input({
  value,
  onChange,
  type = 'text',
  min,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  type?: string
  min?: number
  placeholder?: string
}) {
  return (
    <input
      type={type}
      value={value}
      min={min}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-[var(--color-beige)] focus:border-[var(--color-charcoal)] py-3 outline-none text-sm"
    />
  )
}

function Skeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-5 py-5 border-b border-[var(--color-beige)]">
          <div className="w-16 h-20 bg-[var(--color-beige)]/60 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-1/3 bg-[var(--color-beige)]/60 animate-pulse" />
            <div className="h-3 w-1/2 bg-[var(--color-beige)]/60 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="border border-dashed border-[var(--color-beige)] py-20 text-center">
      <p className="font-display text-3xl text-[var(--color-charcoal)]">No products yet</p>
      <p className="mt-3 max-w-sm mx-auto text-sm text-[var(--color-muted)]">
        Add your first piece — give it a name, a few images, and the sizes and colours it comes in.
      </p>
      <button
        onClick={onAdd}
        className="mt-7 inline-flex items-center gap-2 bg-[var(--color-charcoal)] px-5 py-3 text-xs uppercase tracking-[0.2em] text-[var(--color-offwhite)] hover:opacity-90"
      >
        <Plus size={14} /> Add product
      </button>
    </div>
  )
}
