import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { company } from '../lib/company';
import { Logo } from './Navbar';

// Link groups mirror the navigation on the client's live site.
const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About us' },
  { to: '/products', label: 'Products' },
  { to: '/industries', label: 'Industries' },
  { to: '/blog', label: 'Blog' },
  { to: '/#contact', label: 'Contact us' },
];

const productLinks = [
  { to: '/products?category=levelling-instruments', label: 'Surveying Instruments' },
  { to: '/products?category=gnss-receivers', label: 'GNSS Solutions' },
  { to: '/products?category=lidar-scanners', label: 'Scanning Solutions' },
  { to: '/products?category=survey-drones', label: 'Drone Solutions' },
  { to: '/products?category=surveying-mapping-software', label: 'Software Solutions' },
  { to: '/products?category=marine-water-resources', label: 'Marine & Water Resources' },
];

const heading = 'mb-4 font-display text-xs font-bold uppercase tracking-[0.2em] text-signal';
const link = 'text-sm text-white/65 transition hover:text-signal';

export function Footer() {
  return (
    <footer className="relative bg-ink-950 text-white">
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.06]" aria-hidden />

      <div className="container-x relative grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo dark />
          <p className="max-w-xs text-sm leading-relaxed text-white/65">{company.tagline}</p>
          <p className="max-w-xs text-sm leading-relaxed text-white/45">
            Authorised distributor of Satlab Geosolutions AB (Sweden) and Surveyaan drones in India.
          </p>
        </div>

        <div>
          <h3 className={heading}>Quick links</h3>
          <ul className="space-y-2.5">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link className={link} to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={heading}>Our products</h3>
          <ul className="space-y-2.5">
            {productLinks.map((l) => (
              <li key={l.label}>
                <Link className={link} to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className={heading}>Contact us</h3>
          <ul className="space-y-3.5 text-sm text-white/65">
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <a className="transition hover:text-signal" href={company.phoneHref}>{company.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <a className="break-all transition hover:text-signal" href={company.emailHref}>{company.email}</a>
            </li>
            <li className="flex gap-3">
              <WhatsAppIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#25D366]" />
              <a className="transition hover:text-signal" href={company.whatsapp} target="_blank" rel="noreferrer">
                {company.whatsappDisplay}
              </a>
            </li>
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span>
                {company.address.line1}
                <br />
                {company.address.line2}
              </span>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-signal" /> {company.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p>GSTIN {company.gst} · IEC {company.iec}</p>
        </div>
      </div>
    </footer>
  );
}
