import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { company } from '../lib/company';

// Mirrors the navigation on the client's live site (Home / About us / Products /
// Industries / Contact us).
const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/industries', label: 'Industries' },
  { to: '/blog', label: 'Blog' },
  { to: '/about', label: 'About us' },
  { to: '/contact', label: 'Contact us' },
];

export function Logo({ dark = false }: { dark?: boolean } = {}) {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${company.name} home`}>
      {/* Two files: the original black-lettered mark for light surfaces, and a
          white-lettered version (orange swoosh kept) for dark ones. A CSS
          invert would flatten the swoosh to white too. */}
      <span className="flex items-center">
        <img
          src={dark ? '/apsl-logo-dark.png' : '/apsl-logo.png'}
          alt={`${company.short} logo`}
          width={490}
          height={300}
          className="h-9 w-auto lg:h-10"
        />
      </span>
      <span className="hidden leading-none sm:block">
        <span className={`block text-[11px] font-medium uppercase tracking-[0.25em] ${dark ? 'text-white/55' : 'text-mist'}`}>Solutions LLP</span>
        <span className={`mt-1 block font-display text-[13px] font-semibold tracking-tight ${dark ? 'text-white' : 'text-graphite'}`}>Survey &amp; Geospatial</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname, location.hash]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 bg-ink-950 transition-all duration-300 ${
        scrolled || open ? 'border-b border-white/10 shadow-lg shadow-ink-950/30' : ''
      }`}
    >
      <nav className="container-x flex h-14 items-center justify-between lg:h-16">
        <Logo dark />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition hover:text-signal ${
                    isActive && !l.to.includes('#') ? 'text-signal' : 'text-white/70'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link to="/contact" className="btn-primary hidden sm:inline-flex">
            Get a quote
          </Link>
          <a
            href={company.phoneHref}
            className="btn hidden border border-white/20 bg-white/5 text-white transition hover:border-signal hover:text-signal lg:inline-flex"
            aria-label={`Call ${company.phoneDisplay}`}
          >
            <Phone className="h-4 w-4" /> Call us
          </a>
          <button className="rounded-full p-2 text-white md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="container-x overflow-hidden md:hidden"
          >
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="block border-b border-white/10 py-4 font-display text-lg text-white/85">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="py-4">
              <a href={company.phoneHref} className="btn-primary w-full">
                <Phone className="h-4 w-4" /> {company.phoneDisplay}
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
