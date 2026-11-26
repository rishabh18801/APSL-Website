import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Mail, Phone, Trash2, Undo2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';

export default function Enquiries() {
  const [reload, setReload] = useState(0);
  const { data, loading, error } = useAsync(() => api.enquiries(), [reload]);
  const refresh = () => setReload((r) => r + 1);

  return (
    <div>
      <h1 className="text-2xl font-semibold sm:text-3xl">Enquiries</h1>
      <p className="text-sm text-mist">Messages sent from the website contact and quote forms.</p>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-mist">Loading…</p>}
      {!loading && data?.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-sand p-12 text-center text-mist">No enquiries yet.</div>}
      <div className="mt-6 space-y-3">
        {data?.map((e) => (
          <div key={e.id} className={`rounded-2xl border p-5 ${e.handled ? 'border-sand bg-cream opacity-70' : 'border-sand bg-paper shadow-sm'}`}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="font-semibold text-graphite">{e.name}</div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mist">
                  {e.phone && <a href={`tel:${e.phone}`} className="flex items-center gap-1 hover:text-signal"><Phone className="h-3.5 w-3.5" /> {e.phone}</a>}
                  {e.email && <a href={`mailto:${e.email}`} className="flex items-center gap-1 hover:text-signal"><Mail className="h-3.5 w-3.5" /> {e.email}</a>}
                  <span>{new Date(e.created_at).toLocaleString('en-IN')}</span>
                </div>
                {e.product_name && <Link to={`/products/${e.product_slug}`} target="_blank" className="mt-1 inline-block text-xs text-signal">Re: {e.product_name}</Link>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => api.setEnquiryHandled(e.id, !e.handled).then(refresh)} className="btn-ghost px-3 py-1.5 text-xs">
                  {e.handled ? <><Undo2 className="h-3.5 w-3.5" /> Reopen</> : <><Check className="h-3.5 w-3.5" /> Mark handled</>}
                </button>
                <button onClick={() => confirm('Delete this enquiry permanently?') && api.deleteEnquiry(e.id).then(refresh)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label="Delete enquiry"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-line text-sm text-copy">{e.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
