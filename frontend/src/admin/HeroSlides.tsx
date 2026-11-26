import { useEffect, useRef, useState } from 'react';
import { ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import { api, type HeroSlide } from '../lib/api';
import { useAsync } from '../lib/hooks';

type Draft = {
  id: number | null;
  image: string;
  lead: string;
  accent: string;
  label: string;
  alt: string;
  sort_order: number;
  active: boolean;
};

const EMPTY: Draft = { id: null, image: '', lead: '', accent: '', label: '', alt: '', sort_order: 0, active: true };

/** Create / edit a single slide. Mounted inside a modal. */
function SlideEditor({ draft, onClose, onSaved }: { draft: Draft; onClose: () => void; onSaved: (m: string) => void }) {
  const [d, setD] = useState(draft);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return setPreview('');
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const shown = preview || d.image;

  async function save() {
    if (!shown) return setMsg('A background image is required');
    setSaving(true);
    setMsg('');
    try {
      const form = new FormData();
      form.set('data', JSON.stringify({
        lead: d.lead, accent: d.accent, label: d.label, alt: d.alt,
        sort_order: d.sort_order, active: d.active, keep_image: d.image,
      }));
      if (file) form.set('image', file);
      await api.saveHeroSlide(d.id, form);
      onSaved(d.id ? 'Slide updated' : 'Slide added');
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink-950/40 p-4" role="dialog" aria-modal>
      <div className="w-full max-w-2xl rounded-3xl border border-sand bg-paper p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{d.id ? 'Edit slide' : 'New slide'}</h2>
          <button onClick={onClose} className="btn-ghost px-3" aria-label="Close"><X className="h-4 w-4" /></button>
        </div>

        {msg && <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{msg}</p>}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <span className="label">Background image *</span>
            <div className="mt-1 aspect-[21/9] overflow-hidden rounded-2xl border border-dashed border-sand bg-cream">
              {shown ? <img src={shown} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-mist">No image</div>}
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost mt-3 w-full">
              <ImagePlus className="h-4 w-4" /> {shown ? 'Replace image' : 'Upload image'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-2 text-xs text-mist">Wide landscape works best, around 1920×1000. Up to 6 MB.</p>
          </div>

          <div>
            <label className="label" htmlFor="slide-lead">Quote line 1</label>
            <input id="slide-lead" value={d.lead} onChange={(e) => setD({ ...d, lead: e.target.value })} maxLength={80} className="input" placeholder="Measure the world" />
          </div>
          <div>
            <label className="label" htmlFor="slide-accent">Quote line 2 (orange)</label>
            <input id="slide-accent" value={d.accent} onChange={(e) => setD({ ...d, accent: e.target.value })} maxLength={80} className="input" placeholder="with precision" />
          </div>
          <div>
            <label className="label" htmlFor="slide-label">Button label</label>
            <input id="slide-label" value={d.label} onChange={(e) => setD({ ...d, label: e.target.value })} maxLength={60} className="input" placeholder="GNSS & Total Stations" />
          </div>
          <div>
            <label className="label" htmlFor="slide-order">Order</label>
            <input id="slide-order" type="number" min={0} max={999} value={d.sort_order} onChange={(e) => setD({ ...d, sort_order: Number(e.target.value) })} className="input" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="slide-alt">Image description (for screen readers)</label>
            <input id="slide-alt" value={d.alt} onChange={(e) => setD({ ...d, alt: e.target.value })} maxLength={200} className="input" placeholder="GNSS receiver surveying a highway corridor" />
          </div>
          <label className="flex items-center gap-3 text-sm sm:col-span-2">
            <input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} className="h-4 w-4 accent-[#f5660a]" />
            <span>Show on the home page</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={saving} className="btn-primary"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save slide'}</button>
        </div>
      </div>
    </div>
  );
}

export default function HeroSlides() {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useAsync(() => api.adminHeroSlides(), [reload]);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [confirm, setConfirm] = useState<HeroSlide | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function doDelete() {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.deleteHeroSlide(confirm.id);
      setMsg('Slide deleted');
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
          <h1 className="text-2xl font-semibold sm:text-3xl">Hero slides</h1>
          <p className="text-sm text-mist">Background images and quotes for the home page slideshow.</p>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-primary"><Plus className="h-4 w-4" /> Add slide</button>
      </div>

      {msg && <p className="mt-4 rounded-xl border border-signal/30 bg-signal/10 px-4 py-2 text-sm text-signal" role="status">{msg}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && data?.length === 0 && (
        <p className="mt-6 rounded-2xl border border-sand bg-paper p-10 text-center text-mist">
          No slides yet, so the home page is showing its four built-in slides. Add one here to take over.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {data?.map((s) => (
          <div key={s.id} className="overflow-hidden rounded-3xl border border-sand bg-paper">
            <div className="relative aspect-[21/9] bg-cream">
              <img src={s.image} alt="" className="h-full w-full object-cover" />
              {!s.active && (
                <span className="absolute left-3 top-3 rounded-full bg-ink-950/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Hidden
                </span>
              )}
            </div>
            <div className="p-4">
              <p className="text-sm font-semibold text-graphite">
                {s.lead} <span className="text-signal">{s.accent}</span>
              </p>
              <p className="mt-1 text-xs text-mist">#{s.sort_order} · {s.label || 'No button label'}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => setEditing({ ...s })} className="btn-ghost flex-1">Edit</button>
                <button onClick={() => setConfirm(s)} className="btn-ghost px-3 text-red-600" aria-label="Delete slide">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <SlideEditor
          draft={editing}
          onClose={() => setEditing(null)}
          onSaved={(m) => { setEditing(null); setMsg(m); setReload((r) => r + 1); }}
        />
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/40 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-sm rounded-3xl border border-sand bg-paper p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete this slide?</h2>
            <p className="mt-2 text-sm text-mist">The slide and its image will be removed. This cannot be undone.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setConfirm(null)} className="btn-ghost">Cancel</button>
              <button onClick={doDelete} disabled={busy} className="btn-danger">{busy ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
