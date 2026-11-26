import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { api } from '../lib/api';

export function EnquiryForm({ productId, productName, defaultMessage }: { productId?: number; productName?: string; defaultMessage?: string }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus('sending');
    setError('');
    try {
      await api.sendEnquiry({
        name: String(f.get('name') || ''),
        phone: String(f.get('phone') || ''),
        email: String(f.get('email') || ''),
        message: String(f.get('message') || ''),
        product_id: productId ?? null,
        website: String(f.get('website') || ''),
      });
      setStatus('sent');
    } catch (err) {
      setError((err as Error).message);
      setStatus('idle');
    }
  }

  if (status === 'sent') {
    return (
      <div className="glass flex flex-col items-center gap-3 rounded-3xl p-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-signal" />
        <h3 className="text-xl font-semibold">Thank you, we've got your enquiry</h3>
        <p className="text-sm text-mist">Our team will call you back shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="glass grid gap-4 rounded-3xl p-6 sm:grid-cols-2 sm:p-8">
      <div className="sm:col-span-2">
        <label className="label" htmlFor="enq-name">Your name *</label>
        <input id="enq-name" name="name" required minLength={2} className="input" autoComplete="name" />
      </div>
      <div>
        <label className="label" htmlFor="enq-phone">Phone</label>
        <input id="enq-phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="+91" />
      </div>
      <div>
        <label className="label" htmlFor="enq-email">Email</label>
        <input id="enq-email" name="email" type="email" className="input" autoComplete="email" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="enq-msg">Requirement *</label>
        <textarea
          id="enq-msg"
          name="message"
          required
          minLength={5}
          rows={6}
          className="input resize-none"
          defaultValue={defaultMessage ?? (productName ? `I'm interested in the ${productName}. Please share price and availability.` : '')}
          placeholder="Tell us what you need: product, quantity, rental duration, project location…"
        />
      </div>
      {/* honeypot, hidden from people */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {error && <p className="text-sm text-red-600 sm:col-span-2" role="alert">{error}</p>}
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-mist">Phone or email is required so we can reach you.</p>
        <button className="btn-primary" disabled={status === 'sending'}>
          <Send className="h-4 w-4" /> {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        </button>
      </div>
    </form>
  );
}
