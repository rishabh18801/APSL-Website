import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, Save, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';

export default function BlogForm() {
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const { data, loading, error } = useAsync(() => (isNew ? Promise.resolve(null) : api.adminPost(Number(id))), [id]);

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [published, setPublished] = useState(true);
  const [cover, setCover] = useState('');       // existing cover URL
  const [file, setFile] = useState<File | null>(null); // newly picked file
  const [preview, setPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!data) return;
    setTitle(data.title);
    setAuthor(data.author);
    setExcerpt(data.excerpt);
    setBody(data.body);
    setPublished(data.published);
    setCover(data.cover_image);
  }, [data]);

  // Object URLs must be revoked or the blob stays in memory.
  useEffect(() => {
    if (!file) return setPreview('');
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const form = new FormData();
      form.set('data', JSON.stringify({ title, author, excerpt, body, published, keep_cover: cover }));
      if (file) form.set('cover', file);
      const saved = await api.savePost(isNew ? null : Number(id), form);
      navigate('/admin/blog', { replace: true });
      void saved;
    } catch (err) {
      setMsg((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="h-64 animate-pulse rounded-3xl bg-sand/40" />;
  if (error) return <p className="text-red-600">{error}</p>;

  const shown = preview || cover;

  return (
    <form onSubmit={onSubmit}>
      <Link to="/admin/blog" className="inline-flex items-center gap-2 text-sm text-mist hover:text-signal">
        <ArrowLeft className="h-4 w-4" /> Back to blog
      </Link>
      <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">{isNew ? 'New post' : 'Edit post'}</h1>

      {msg && <p className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700" role="alert">{msg}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="grid gap-4 rounded-3xl border border-sand bg-paper p-5">
          <div>
            <label className="label" htmlFor="post-title">Title *</label>
            <input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} maxLength={200} className="input" />
          </div>
          <div>
            <label className="label" htmlFor="post-excerpt">Excerpt</label>
            <textarea
              id="post-excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={400}
              rows={2}
              className="input resize-none"
              placeholder="One or two lines shown on the blog listing."
            />
          </div>
          <div>
            <label className="label" htmlFor="post-body">Body</label>
            <textarea
              id="post-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className="input resize-y font-mono text-[13px]"
              placeholder={'Write in plain paragraphs separated by a blank line.\n\n## Use two hashes for a heading'}
            />
            <p className="mt-1 text-xs text-mist">Blank line = new paragraph. A line starting with ## becomes a heading.</p>
          </div>
        </div>

        <div className="grid content-start gap-4">
          <div className="rounded-3xl border border-sand bg-paper p-5">
            <span className="label">Cover image</span>
            <div className="mt-1 aspect-[16/10] overflow-hidden rounded-2xl border border-dashed border-sand bg-cream">
              {shown ? (
                <img src={shown} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-mist">No image</div>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost flex-1">
                <ImagePlus className="h-4 w-4" /> {shown ? 'Replace' : 'Upload'}
              </button>
              {shown && (
                <button
                  type="button"
                  onClick={() => { setFile(null); setCover(''); if (fileRef.current) fileRef.current.value = ''; }}
                  className="btn-ghost px-3 text-red-600"
                  aria-label="Remove cover image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-2 text-xs text-mist">JPG, PNG, WEBP or AVIF, up to 6 MB.</p>
          </div>

          <div className="grid gap-4 rounded-3xl border border-sand bg-paper p-5">
            <div>
              <label className="label" htmlFor="post-author">Author</label>
              <input id="post-author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={80} className="input" placeholder="APSL Solutions" />
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4 accent-[#f5660a]" />
              <span>Published <span className="text-mist">(uncheck to keep as a draft)</span></span>
            </label>
          </div>

          <button className="btn-primary" disabled={saving}>
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save post'}
          </button>
        </div>
      </div>
    </form>
  );
}
