import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Star, ExternalLink } from 'lucide-react';
import { api, type Product } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { formatPrice, productImage } from '../lib/format';

export default function ProductList() {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useAsync(() => api.adminProducts(), [reload]);
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<Product | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const rows = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((p) => !s || p.name.toLowerCase().includes(s) || (p.category_name ?? '').toLowerCase().includes(s));
  }, [data, q]);

  async function doDelete() {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.deleteProduct(confirm.id);
      setMsg(`Deleted "${confirm.name}"`);
      setConfirm(null);
      setReload((r) => r + 1);
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">Products</h1>
          <p className="text-sm text-mist">{data ? `${data.length} products in the catalogue` : 'Loading…'}</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary"><Plus className="h-4 w-4" /> Add product</Link>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name or category" className="input pl-10" />
      </div>

      {msg && <p className="mt-4 rounded-xl border border-signal/30 bg-signal/10 px-4 py-2 text-sm text-signal" role="status">{msg}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-sand">
        <table className="w-full text-left text-sm">
          <thead className="hidden bg-cream text-xs uppercase tracking-wider text-mist md:table-header-group">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Images</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {loading && (
              <tr><td className="px-4 py-8 text-center text-mist" colSpan={5}>Loading…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td className="px-4 py-8 text-center text-mist" colSpan={5}>No products found.</td></tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-paper p-4 md:table-row md:p-0">
                <td className="flex min-w-0 flex-1 items-center gap-3 md:px-4 md:py-3">
                  <img src={productImage(p.images)} alt="" className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain p-1" onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 font-medium text-graphite">
                      <span className="truncate">{p.name}</span>
                      {p.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-beam text-beam" aria-label="Featured" />}
                    </div>
                    <div className="truncate text-xs text-mist">/{p.slug}</div>
                  </div>
                </td>
                <td className="text-mist md:px-4 md:py-3">{p.category_name ?? '-'}</td>
                <td className="whitespace-nowrap text-graphite md:px-4 md:py-3">{formatPrice(p.price_inr)}</td>
                <td className="text-mist md:px-4 md:py-3">{p.images.length}</td>
                <td className="ml-auto md:px-4 md:py-3">
                  <div className="flex justify-end gap-1">
                    <a href={`/products/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-2 text-mist hover:bg-sand/50 hover:text-graphite" aria-label={`View ${p.name}`}><ExternalLink className="h-4 w-4" /></a>
                    <Link to={`/admin/products/${p.id}`} className="rounded-lg p-2 text-mist hover:bg-sand/50 hover:text-graphite" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></Link>
                    <button onClick={() => setConfirm(p)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="del-title">
          <div className="w-full max-w-md rounded-3xl border border-sand bg-paper p-6 shadow-xl">
            <h2 id="del-title" className="text-lg font-semibold">Delete this product?</h2>
            <p className="mt-2 text-sm text-mist">
              <strong className="text-graphite">{confirm.name}</strong> and its uploaded images will be removed permanently. This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setConfirm(null)} disabled={busy}>Cancel</button>
              <button className="btn-danger" onClick={doDelete} disabled={busy}><Trash2 className="h-4 w-4" /> {busy ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
