import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { Reveal } from '../components/Reveal';

export default function Products() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const q = params.get('q') || '';
  const [draft, setDraft] = useState(q);

  const categories = useAsync(() => api.categories(), []);
  const products = useAsync(() => api.products({ category, q }), [category, q]);

  // Debounce search input into the URL.
  useEffect(() => {
    const t = setTimeout(() => {
      if (draft === q) return;
      const next = new URLSearchParams(params);
      draft ? next.set('q', draft) : next.delete('q');
      setParams(next, { replace: true });
    }, 300);
    return () => clearTimeout(t);
  }, [draft]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = 'Products | APSL Solutions LLP';
  }, []);

  function pick(slug: string) {
    const next = new URLSearchParams(params);
    slug ? next.set('category', slug) : next.delete('category');
    setParams(next);
  }

  const active = categories.data?.find((c) => c.slug === category);

  return (
    <div className="pt-28 sm:pt-36">
      <section className="container-x">
        <Reveal>
          <span className="eyebrow"><span className="h-px w-6 bg-signal" /> Product catalogue</span>
          <h1 className="mt-4 text-4xl font-bold sm:text-6xl">{active ? active.name : 'All products'}</h1>
          <p className="mt-4 max-w-2xl text-mist">
            {active ? active.description : 'Genuine Satlab and Surveyaan equipment plus Auto Plotter software, with prices shown where available.'}
          </p>
        </Reveal>

        <div className="sticky top-16 z-30 -mx-4 mt-10 border-b border-sand bg-cream/90 px-4 py-4 backdrop-blur-xl sm:mx-0 sm:rounded-2xl sm:border sm:px-4 lg:top-20">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search products…" className="input pl-10" aria-label="Search products" />
              {draft && (
                <button onClick={() => setDraft('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-graphite" aria-label="Clear search"><X className="h-4 w-4" /></button>
              )}
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
              <button onClick={() => pick('')} className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${!category ? 'bg-signal font-semibold text-white' : 'border border-sand bg-paper text-mist hover:border-signal/50 hover:text-signal'}`}>
                All
              </button>
              {categories.data?.map((c) => (
                <button
                  key={c.id}
                  onClick={() => pick(c.slug)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm transition ${category === c.slug ? 'bg-signal font-semibold text-white' : 'border border-sand bg-paper text-mist hover:border-signal/50 hover:text-signal'}`}
                >
                  <CategoryIcon slug={c.slug} className="h-4 w-4" /> {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-12 sm:py-16">
        {products.error && <p className="text-red-600">Could not load products: {products.error}</p>}
        {!products.loading && products.data?.length === 0 && (
          <div className="rounded-3xl border border-dashed border-sand p-16 text-center text-mist">No products match your search.</div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.loading && Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {!products.loading &&
            products.data?.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 0.05}>
                <ProductCard product={p} />
              </Reveal>
            ))}
        </div>
      </section>
    </div>
  );
}
