import { useEffect } from 'react';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { EnquiryForm } from '../components/EnquiryForm';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { company, whatsappLink } from '../lib/company';

const mapQuery = encodeURIComponent(company.address.full);

export default function Contact() {
  useEffect(() => {
    document.title = `Contact us | ${company.name}`;
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Contact us"
        title="Let's talk about"
        accent="your project"
        text="Ask for a quote, a demo or rental availability. We usually respond the same working day."
        image="/hero/hero-gnss-banner.webp"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'Contact us' }]}
      />

      {/* Quick contact cards */}
      <section className="container-x -mt-10 relative z-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Phone,
              label: 'Call us',
              value: company.phoneDisplay,
              href: company.phoneHref,
              hint: 'Mon – Sat, working hours',
            },
            {
              icon: WhatsAppIcon,
              label: 'WhatsApp',
              value: company.whatsappDisplay,
              href: whatsappLink('Hi APSL, I would like to enquire about survey equipment.'),
              hint: 'Fastest way to reach our sales team',
              external: true,
              green: true,
            },
            {
              icon: Mail,
              label: 'Email',
              value: company.email,
              href: company.emailHref,
              hint: 'Quotes, tenders and documentation',
            },
            {
              icon: MapPin,
              label: 'Office',
              value: company.address.line1,
              hint: company.address.line2,
            },
          ].map((c, i) => {
            const Icon = c.icon;
            const inner = (
              <>
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl ${
                    c.green ? 'bg-[#25D366]/12 text-[#25D366]' : 'bg-signal/10 text-signal'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="mt-4 block text-xs uppercase tracking-wider text-mist">{c.label}</span>
                <span className="mt-1 block break-words font-medium text-graphite">{c.value}</span>
                <span className="mt-1 block text-xs text-mist">{c.hint}</span>
              </>
            );
            const cls =
              'block h-full rounded-3xl border border-sand bg-paper p-6 shadow-sm transition hover:-translate-y-1 hover:border-signal/50 hover:shadow-lg';
            return (
              <Reveal key={c.label} delay={i * 0.06}>
                {c.href ? (
                  <a
                    href={c.href}
                    className={cls}
                    {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {inner}
                  </a>
                ) : (
                  <div className={cls}>{inner}</div>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Form + details */}
      <section className="container-x py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <Reveal>
            <span className="eyebrow"><span className="h-px w-6 bg-signal" /> Send an enquiry</span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">Tell us what you need</h2>
            <p className="mt-4 max-w-xl text-mist">
              Share the product, quantity, rental duration or project location. The more detail you give, the more useful our first
              reply will be.
            </p>
            <div className="mt-8">
              <EnquiryForm />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-sand bg-paper p-7 shadow-sm">
              <h3 className="text-lg font-semibold">Visit our office</h3>
              <ul className="mt-5 space-y-4 text-sm">
                <li className="flex gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <span className="text-copy">
                    {company.name}
                    <br />
                    {company.address.line1}
                    <br />
                    {company.address.line2}
                  </span>
                </li>
                <li className="flex gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <span className="text-copy">{company.hours}</span>
                </li>
              </ul>

              <div className="mt-6 overflow-hidden rounded-2xl border border-sand">
                <iframe
                  title={`Map showing ${company.name}`}
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  width="100%"
                  height="260"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  style={{ border: 0 }}
                />
              </div>

              <dl className="mt-6 space-y-2 border-t border-sand pt-5 text-xs text-mist">
                <div className="flex justify-between gap-4">
                  <dt>GSTIN</dt>
                  <dd className="font-medium text-graphite">{company.gst}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>IEC</dt>
                  <dd className="font-medium text-graphite">{company.iec}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>Established</dt>
                  <dd className="font-medium text-graphite">{company.established}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
