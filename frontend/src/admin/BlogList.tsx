import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, ExternalLink, EyeOff } from 'lucide-react';
import { api, type Post } from '../lib/api';
import { useAsync } from '../lib/hooks';

function when(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BlogList() {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useAsync(() => api.adminPosts(), [reload]);
  const [confirm, setConfirm] = useState<Post | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function doDelete() {
    if (!confirm) return;
    setBusy(true);
    try {
      await api.deletePost(confirm.id);
      setMsg(`Deleted "${confirm.title}"`);
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
          <h1 className="text-2xl font-semibold sm:text-3xl">Blog</h1>
          <p className="text-sm text-mist">{data ? `${data.length} post${data.length === 1 ? '' : 's'}` : 'Loading…'}</p>
        </div>
        <Link to="/admin/blog/new" className="btn-primary"><Plus className="h-4 w-4" /> Add post</Link>
      </div>

      {msg && <p className="mt-4 rounded-xl border border-signal/30 bg-signal/10 px-4 py-2 text-sm text-signal" role="status">{msg}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {!loading && data?.length === 0 && (
        <p className="mt-6 rounded-2xl border border-sand bg-paper p-10 text-center text-mist">
          No posts yet. Use “Add post” to write the first one.
        </p>
      )}

      <div className="mt-6 grid gap-3">
        {data?.map((post) => (
          <div key={post.id} className="flex items-center gap-4 rounded-2xl border border-sand bg-paper p-3">
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-sand bg-cream">
              {post.cover_image && <img src={post.cover_image} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-semibold text-graphite">{post.title}</h2>
                {!post.published && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-mist">
                    <EyeOff className="h-3 w-3" /> Draft
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-mist">{when(post.created_at)} · /blog/{post.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {post.published && (
                <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn-ghost px-3" aria-label="View post">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
              <Link to={`/admin/blog/${post.id}`} className="btn-ghost px-3" aria-label="Edit post"><Pencil className="h-4 w-4" /></Link>
              <button onClick={() => setConfirm(post)} className="btn-ghost px-3 text-red-600" aria-label="Delete post">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink-950/40 p-4" role="dialog" aria-modal>
          <div className="w-full max-w-sm rounded-3xl border border-sand bg-paper p-6 shadow-lg">
            <h2 className="text-lg font-semibold">Delete this post?</h2>
            <p className="mt-2 text-sm text-mist">“{confirm.title}” and its cover image will be removed. This cannot be undone.</p>
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
