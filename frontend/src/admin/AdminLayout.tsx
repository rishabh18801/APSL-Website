import { NavLink, Outlet, Link } from 'react-router-dom';
import { Package, Inbox, LogOut, ExternalLink, Plus, Newspaper, Images } from 'lucide-react';
import { useAuth } from './auth';
import { Logo } from '../components/Navbar';

export default function AdminLayout() {
  const { email, logout } = useAuth();
  const item = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${isActive ? 'bg-signal/10 font-semibold text-signal' : 'text-mist hover:bg-sand/50 hover:text-graphite'}`;
  return (
    <div className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-sand bg-cream/90 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            <nav className="hidden items-center gap-1 sm:flex">
              <NavLink to="/admin" end className={item}><Package className="h-4 w-4" /> Products</NavLink>
              <NavLink to="/admin/blog" className={item}><Newspaper className="h-4 w-4" /> Blog</NavLink>
              <NavLink to="/admin/hero" className={item}><Images className="h-4 w-4" /> Hero slides</NavLink>
              <NavLink to="/admin/enquiries" className={item}><Inbox className="h-4 w-4" /> Enquiries</NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="btn-ghost hidden px-3 md:inline-flex"><ExternalLink className="h-4 w-4" /> View site</Link>
            <span className="hidden text-xs text-mist lg:inline">{email}</span>
            <button onClick={logout} className="btn-ghost px-3" aria-label="Sign out"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span></button>
          </div>
        </div>
        <nav className="container-x flex gap-1 overflow-x-auto pb-2 [scrollbar-width:none] sm:hidden">
          <NavLink to="/admin" end className={item}><Package className="h-4 w-4" /> Products</NavLink>
          <NavLink to="/admin/blog" className={item}><Newspaper className="h-4 w-4" /> Blog</NavLink>
          <NavLink to="/admin/hero" className={item}><Images className="h-4 w-4" /> Hero</NavLink>
          <NavLink to="/admin/enquiries" className={item}><Inbox className="h-4 w-4" /> Enquiries</NavLink>
          <NavLink to="/admin/products/new" className={item}><Plus className="h-4 w-4" /> New</NavLink>
        </nav>
      </header>
      <main className="container-x py-8">
        <Outlet />
      </main>
    </div>
  );
}
