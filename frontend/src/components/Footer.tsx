import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { WhatsAppIcon } from './WhatsAppIcon';
import { company } from '../lib/company';
import { Logo } from './Navbar';

// Link groups mirror the footer on the client's live site.
const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/#about', label: 'About us' },
  { to: '/products', label: 'Products' },
  { to: '/#industries', label: 'Industries' },
  { to: '/blog', label: 'Blog' },
  { to: '/#contact', label: 'Contact us' },
];

const productLinks = [
  { to: '/products?category=levelling-instruments', label: 'Surveying Instruments' },
  { to: '/products?category=gnss-receivers', label: 'GNSS Solutions' },
  { to: '/products?category=lidar-scanners', label: 'Scanning Solutions' },
  { to: '/products?category=survey-drones', label: 'Drone Solutions' },
  { to: '/products?category=surveying-mapping-software', label: 'Software Solutions' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-sand bg-paper">
      <div className="container-x grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-md text-sm leading-relaxed text-mist">{company.tagline}</p>
          <p className="max-w-md text-sm leading-relaxed text-mist">
            Authorised distributor of Satlab Geosolutions AB (Sweden) and Surveyaan drones in India.
          </p>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Quick links</h3>
          <ul className="space-y-2 text-sm text-mist">
            {quickLinks.map((l) => (
              <li key={l.label}>
                <Link className="transition hover:text-signal" to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Products</h3>
          <ul className="space-y-2 text-sm text-mist">
            {productLinks.map((l) => (
              <li key={l.label}>
                <Link className="transition hover:text-signal" to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Contact us</h3>
          <ul className="space-y-3 text-sm text-mist">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span>
                {company.name}
                <br />
                {company.address.line1}
                <br />
                {company.address.line2}
              </span>
            </li>
            <li>
              <a className="flex gap-2 transition hover:text-signal" href={company.phoneHref}>
                <Phone className="h-4 w-4 shrink-0 text-signal" /> {company.phoneDisplay}
              </a>
            </li>
            <li>
              <a className="flex gap-2 break-all transition hover:text-signal" href={company.emailHref}>
                <Mail className="h-4 w-4 shrink-0 text-signal" /> {company.email}
              </a>
            </li>
            <li>
              <a className="flex gap-2 transition hover:text-signal" href={company.whatsapp} target="_blank" rel="noreferrer">
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" /> WhatsApp
              </a>
            </li>
            <li className="flex gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-signal" /> {company.hours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-sand">
        <div className="container-x flex flex-col gap-2 py-6 text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {company.name}. All rights reserved.</p>
          <p>GSTIN {company.gst} · IEC {company.iec}</p>
        </div>
      </div>
    </footer>
  );
}
