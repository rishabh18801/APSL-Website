import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { formatPrice, productImage } from '../lib/format';
import { productWhatsappLink } from '../lib/company';
import { CategoryIcon } from '../components/CategoryIcon';
import { ProductCard } from '../components/ProductCard';
import { EnquiryForm } from '../components/EnquiryForm';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { Reveal } from '../components/Reveal';
import NotFound from './NotFound';

/**
 * Product descriptions are seeded from the client's site as light Markdown:
 * "## Heading" lines followed by paragraphs. Renders those as real headings
 * instead of printing the "##" characters.
 */
function Description({ text }: { text: string }) {
  const blocks = text
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="mt-12">
      {blocks.map((block, i) => {
        const heading = block.match(/^#{2,3}\s+(.*)$/);
        if (heading) {
          return (
            <h2 key={i} className={`text-xl font-semibold ${i === 0 ? '' : 'mt-10'}`}>
              {heading[1]}
            </h2>
          );
        }
        return (
          <p key={i} className="mt-4 leading-relaxed text-copy">
            {block}
          </p>
        );
      })}
    </div>
  );
}

export default function ProductDetail() {
  const { slug = '' } = useParams();
  const { data: p, loading, error } = useAsync(() => api.product(slug), [slug]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    window.scrollTo(0, 0);
  }, [slug]);
  useEffect(() => {
    if (p) document.title = `${p.name} | APSL Solutions LLP`;
  }, [p]);

  if (loading) {
    return (
      <div className="container-x grid animate-pulse gap-10 pt-32 lg:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-sand/50" />
        <div className="space-y-4"><div className="h-10 w-3/4 rounded bg-sand" /><div className="h-4 w-full rounded bg-sand/60" /><div className="h-4 w-2/3 rounded bg-sand/60" /></div>
      </div>
    );
  }
  if (error || !p) return <NotFound />;

  // Jump to the enquiry form and drop the cursor straight into Requirement,
  // which is already pre-filled with this product's details.
  function onQuoteClick() {
    window.setTimeout(() => {
      document.getElementById('enq-msg')?.focus({ preventScroll: true });
    }, 450);
  }

  const images = p.images.length ? p.images : [productImage([])];

  return (
    <div className="pt-24 sm:pt-32">
      <div className="container-x">
        <Link to={p.category_slug ? `/products?category=${p.category_slug}` : '/products'} className="inline-flex items-center gap-2 text-sm text-mist hover:text-signal">
          <ArrowLeft className="h-4 w-4" /> Back to {p.category_name ?? 'products'}
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-sand bg-gradient-to-br from-white to-sand/50">
              <AnimatePresence mode="wait">
                <motion.img
                  key={images[active]}
                  src={images[active]}
                  alt={p.name}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="h-full w-full object-contain p-10"
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')}
                />
              </AnimatePresence>
            </div>
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1.5 transition ${i === active ? 'border-signal' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    aria-label={`Show image ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Reveal>
              <span className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-signal">
                <CategoryIcon slug={p.category_slug} className="h-4 w-4" /> {p.category_name}
                {p.brand && <span className="text-mist">· {p.brand}</span>}
              </span>
              <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">{p.name}</h1>
              <p className="mt-5 text-lg text-mist">{p.short_description}</p>
              <div className="mt-8 flex flex-col gap-4 rounded-3xl border border-sand bg-paper p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="block text-xs uppercase tracking-wider text-mist">Price</span>
                  <span className="font-display text-2xl font-bold text-graphite">{formatPrice(p.price_inr, p.price_unit)}</span>
                  {p.price_inr != null && <span className="block text-xs text-mist">Indicative, excluding GST. Contact us for a final quote.</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={productWhatsappLink({ name: p.name, brand: p.brand, category_name: p.category_name, priceText: formatPrice(p.price_inr, p.price_unit) })}
                    target="_blank"
                    rel="noreferrer"
                    className="btn bg-[#25D366] text-white shadow-[0_8px_24px_-10px_rgba(37,211,102,0.9)] hover:bg-[#1EBE5B]"
                  >
                    <WhatsAppIcon className="h-[1.1rem] w-[1.1rem]" /> WhatsApp
                  </a>
                  <a href="#enquiry" onClick={onQuoteClick} className="btn-primary">
                    Get a quote <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </Reveal>

            {p.specs.length > 0 && (
              <Reveal delay={0.05}>
                <h2 className="mt-12 text-xl font-semibold">Key specifications</h2>
                <dl className="mt-4 divide-y divide-sand overflow-hidden rounded-2xl border border-sand">
                  {p.specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-2 gap-4 bg-paper px-5 py-3.5 text-sm">
                      <dt className="text-mist">{s.label}</dt>
                      <dd className="font-medium text-graphite">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            {p.description && (
              <Reveal delay={0.05}>
                <Description text={p.description} />
              </Reveal>
            )}

            <Reveal delay={0.05}>
              <h2 id="enquiry" className="mb-4 mt-12 scroll-mt-24 text-xl font-semibold">Request a quote</h2>
              <EnquiryForm
                productId={p.id}
                productName={p.name}
                defaultMessage={[
                  `I'm interested in the ${p.name}.`,
                  p.brand ? `Brand: ${p.brand}` : '',
                  p.category_name ? `Category: ${p.category_name}` : '',
                  `Listed price: ${formatPrice(p.price_inr, p.price_unit)}`,
                  '',
                  'Please share price, availability and delivery time.',
                ].filter(Boolean).join('\n')}
              />
            </Reveal>
          </div>
        </div>
      </div>

      {p.related && p.related.length > 0 && (
        <section className="container-x py-14 sm:py-20">
          <h2 className="text-2xl font-semibold sm:text-3xl">Related products</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {p.related.map((r) => <ProductCard key={r.id} product={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
