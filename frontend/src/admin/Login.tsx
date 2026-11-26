import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from './auth';
import { Logo } from '../components/Navbar';

export default function Login() {
  const { email, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const from = (location.state as { from?: string } | null)?.from || '/admin';

  if (email) return <Navigate to={from} replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError('');
    try {
      await login(String(f.get('email')), String(f.get('password')));
      navigate(from, { replace: true });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center px-4">
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-signal/10 blur-3xl" />
      <form onSubmit={onSubmit} className="glass relative w-full max-w-sm space-y-5 rounded-3xl p-8">
        <Logo />
        <div>
          <h1 className="text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-mist">Manage products and enquiries.</p>
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button className="btn-primary w-full py-3" disabled={busy}>
          <Lock className="h-4 w-4" /> {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
