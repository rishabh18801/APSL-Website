import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Plus, Save, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { api, type Category, type Spec } from '../lib/api';

interface FormState {
  name: string;
  category_id: number | null;
  brand: string;
  short_description: string;
  description: string;
  price: string;
  price_unit: string;
  featured: boolean;
  specs: Spec[];
  images: string[]; // existing image URLs, in order
}

const empty: FormState = {
  name: '', category_id: null, brand: 'Satlab', short_description: '', description: '',
  price: '', price_unit: 'Piece', featured: false, specs: [], images: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const productId = id && id !== 'new' ? Number(id) : null;
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(empty);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCat, setNewCat] = useState('');
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!productId) return;
    api.adminProduct(productId)
      .then((p) =>
        setForm({
          name: p.name, category_id: p.category_id, brand: p.brand, short_description: p.short_description,
          description: p.description, price: p.price_inr == null ? '' : String(p.price_inr), price_unit: p.price_unit,
          featured: p.featured, specs: p.specs, images: p.images,
        }),
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [productId]);

  // Revoke preview object URLs when they go away.
  useEffect(() => () => files.forEach((f) => URL.revokeObjectURL(f.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  function addFiles(list: FileList | null) {
    if (!list) return;
    const ok = Array.from(list).filter((f) => /^image\/(jpeg|png|webp|avif)$/.test(f.type) && f.size <= 6 * 1024 * 1024);
    if (ok.length < list.length) setError('Some files were skipped: use JPG, PNG, WEBP or AVIF up to 6 MB.');
    setFiles((cur) => [...cur, ...ok.map((file) => ({ file, url: URL.createObjectURL(file) }))].slice(0, 10));
  }

  function moveImage(i: number, dir: -1 | 1) {
    const next = [...form.images];
    const j = i + dir;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set('images', next);
  }

  async function addCategory() {
    if (newCat.trim().length < 2) return;
    try {
      const c = await api.createCategory(newCat.trim());
      setCategories((cs) => [...cs.filter((x) => x.id !== c.id), c]);
      set('category_id', c.id);
      setNewCat('');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.images.length + files.length === 0 && !confirm('Save without any image?')) return;
    setSaving(true);
    const fd = new FormData();
    fd.append(
      'data',
      JSON.stringify({
        name: form.name,
        category_id: form.category_id,
        brand: form.brand,
        short_description: form.short_description,
        description: form.description,
        specs: form.specs.filter((s) => s.label.trim() && s.value.trim()),
        price_inr: form.price.trim() === '' ? null : Number(form.price.replace(/[,\s]/g, '')),
        price_unit: form.price_unit || 'Piece',
        featured: form.featured,
        keep_images: form.images,
      }),
    );
    files.forEach((f) => fd.append('images', f.file));
    try {
      await api.saveProduct(productId, fd);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError((err as Error).message);
      setSaving(false);
    }
  }

  if (loading) return <p className="text-mist">Loading product…</p>;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-4xl">
      <Link to="/admin" className="inline-flex items-center gap-2 text-sm text-mist hover:text-signal"><ArrowLeft className="h-4 w-4" /> All products</Link>
      <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{productId ? 'Edit product' : 'Add product'}</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5 rounded-3xl border border-sand bg-paper p-6 shadow-sm">
          <div>
            <label className="label" htmlFor="name">Product name *</label>
            <input id="name" required minLength={2} maxLength={160} value={form.name} onChange={(e) => set('name', e.target.value)} className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="cat">Category</label>
              <select id="cat" value={form.category_id ?? ''} onChange={(e) => set('category_id', e.target.value ? Number(e.target.value) : null)} className="input">
                <option value="">Uncategorised</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="mt-2 flex gap-2">
                <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category" className="input py-1.5 text-xs" aria-label="New category name" />
                <button type="button" onClick={addCategory} className="btn-ghost shrink-0 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Add</button>
              </div>
            </div>
            <div>
              <label className="label" htmlFor="brand">Brand</label>
              <input id="brand" value={form.brand} maxLength={80} onChange={(e) => set('brand', e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="short">Short description</label>
            <input id="short" value={form.short_description} maxLength={300} onChange={(e) => set('short_description', e.target.value)} className="input" placeholder="One line shown on product cards" />
          </div>
          <div>
            <label className="label" htmlFor="desc">Full description</label>
            <textarea id="desc" rows={7} value={form.description} maxLength={10000} onChange={(e) => set('description', e.target.value)} className="input" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="label mb-0">Specifications</span>
              <button type="button" onClick={() => set('specs', [...form.specs, { label: '', value: '' }])} className="btn-ghost px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5" /> Add row</button>
            </div>
            <div className="mt-3 space-y-2">
              {form.specs.length === 0 && <p className="text-xs text-mist">No specifications yet.</p>}
              {form.specs.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input value={s.label} onChange={(e) => set('specs', form.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="e.g. Accuracy" className="input" aria-label="Spec name" />
                  <input value={s.value} onChange={(e) => set('specs', form.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} placeholder="e.g. ±2 mm" className="input" aria-label="Spec value" />
                  <button type="button" onClick={() => set('specs', form.specs.filter((_, j) => j !== i))} className="rounded-lg px-2 text-red-600 hover:bg-red-50" aria-label="Remove spec"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-4 rounded-3xl border border-sand bg-paper p-6 shadow-sm">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div>
                <label className="label" htmlFor="price">Price (₹)</label>
                <input id="price" inputMode="numeric" value={form.price} onChange={(e) => set('price', e.target.value)} className="input" placeholder="Leave empty for 'on request'" />
              </div>
              <div className="w-28">
                <label className="label" htmlFor="unit">Per</label>
                <input id="unit" value={form.price_unit} maxLength={30} onChange={(e) => set('price_unit', e.target.value)} className="input" />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-sm text-graphite">
              <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-[#f5660a]" />
              Feature on homepage
            </label>
          </div>

          <div className="rounded-3xl border border-sand bg-paper p-6 shadow-sm">
            <span className="label">Images</span>
            <p className="text-xs text-mist">The first image is the main photo. JPG, PNG, WEBP or AVIF, up to 6 MB each.</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {form.images.map((src, i) => (
                <div key={src} className="group relative aspect-square overflow-hidden rounded-xl border border-sand bg-white">
                  <img src={src} alt="" className="h-full w-full object-contain p-1" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-signal px-1.5 text-[10px] font-bold text-white">MAIN</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink-950/80 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <button type="button" onClick={() => moveImage(i, -1)} className="p-0.5 text-white" aria-label="Move left"><ChevronLeft className="h-4 w-4" /></button>
                    <button type="button" onClick={() => set('images', form.images.filter((x) => x !== src))} className="p-0.5 text-red-400" aria-label="Remove image"><Trash2 className="h-4 w-4" /></button>
                    <button type="button" onClick={() => moveImage(i, 1)} className="p-0.5 text-white" aria-label="Move right"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              ))}
              {files.map((f) => (
                <div key={f.url} className="relative aspect-square overflow-hidden rounded-xl border border-dashed border-signal/50 bg-white">
                  <img src={f.url} alt="" className="h-full w-full object-contain p-1" />
                  <span className="absolute left-1 top-1 rounded bg-beam px-1.5 text-[10px] font-bold text-graphite">NEW</span>
                  <button type="button" onClick={() => setFiles((cur) => cur.filter((x) => x !== f))} className="absolute right-1 top-1 rounded bg-white/90 p-0.5 text-red-600 shadow-sm" aria-label="Remove new image"><X className="h-4 w-4" /></button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                className="grid aspect-square place-items-center rounded-xl border border-dashed border-sand text-mist transition hover:border-signal hover:text-signal"
              >
                <span className="flex flex-col items-center gap-1 text-xs"><ImagePlus className="h-6 w-6" /> Upload</span>
              </button>
            </div>
            <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
          </div>
        </div>
      </div>

      {error && <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{error}</p>}
      <div className="sticky bottom-0 mt-6 flex justify-end gap-2 border-t border-sand bg-cream/90 py-4 backdrop-blur">
        <Link to="/admin" className="btn-ghost">Cancel</Link>
        <button className="btn-primary" disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving…' : productId ? 'Save changes' : 'Create product'}</button>
      </div>
    </form>
  );
}
