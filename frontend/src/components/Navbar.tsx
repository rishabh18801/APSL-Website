import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { company } from '../lib/company';

// Mirrors the navigation on the client's live site (Home / About us / Products /
// Industries / Contact us).
const links = [
  { to: '/', label: 'Home' },
  { to: '/#about', label: 'About us' },
  { to: '/products', label: 'Products' },
  { to: '/#industries', label: 'Industries' },
  { to: '/blog', label: 'Blog' },
  { to: '/#contact', label: 'Contact us' },
];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-3" aria-label={`${company.name} home`}>
      {/* The brand mark has black lettering, so it sits directly on the light
          surface with no chip behind it. */}
      <span className="flex items-center">
        <img
          src="/apsl-logo.png"
          alt={`${company.short} logo`}
          width={490}
          height={300}
          className="h-9 w-auto lg:h-10"
        />
      </span>
      <span className="hidden leading-none sm:block">
        <span className="block text-[11px] font-medium uppercase tracking-[0.25em] text-mist">Solutions LLP</span>
        <span className="mt-1 block font-display text-[13px] font-semibold tracking-tight text-graphite">Survey &amp; Geospatial</span>
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
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? 'border-b border-sand bg-cream/85 backdrop-blur-xl' : ''}`}>
      <nav className="container-x flex h-14 items-center justify-between lg:h-16">
        <Logo />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition hover:text-signal ${isActive && !l.to.includes('#') ? 'text-graphite' : 'text-mist'}`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <Link to="/#contact" className="btn-primary hidden sm:inline-flex">
            Get a quote
          </Link>
          <a href={company.phoneHref} className="btn-ghost hidden lg:inline-flex" aria-label={`Call ${company.phoneDisplay}`}>
            <Phone className="h-4 w-4" /> Call us
          </a>
          <button className="rounded-full p-2 text-graphite md:hidden" onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>
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
                <Link to={l.to} className="block border-b border-sand py-4 font-display text-lg text-graphite">
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
