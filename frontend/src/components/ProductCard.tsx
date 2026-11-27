import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import type { Product } from '../lib/api';
import { formatPrice, productImage } from '../lib/format';
import { CategoryIcon } from './CategoryIcon';

/**
 * True on devices driven by a mouse. Touch screens skip the 3D tilt: the
 * perspective/preserve-3d layer it needs is rasterised once and then scaled,
 * which makes the card look blurry on high-density phone screens.
 */
function useFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const on = () => setFine(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return fine;
}

/** Product card with a subtle 3D tilt that follows the pointer. */
export function ProductCard({ product }: { product: Product }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();
  const finePointer = useFinePointer();
  const tilt = finePointer && !reduce;
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 200, damping: 20 });
  const glow = useTransform([mx, my] as const, ([x, y]: number[]) => `radial-gradient(400px circle at ${x * 100}% ${y * 100}%, rgba(245,102,10,0.12), transparent 45%)`);

  function onMove(e: React.PointerEvent) {
    if (reduce || e.pointerType !== 'mouse') return;
    const r = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div style={tilt ? { perspective: 900 } : undefined} className="h-full">
      <motion.div style={tilt ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined} className="h-full">
        <Link
          ref={ref}
          to={`/products/${product.slug}`}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-sand bg-paper shadow-sm transition hover:border-signal/50 hover:shadow-lg"
        >
          {tilt && <motion.div className="pointer-events-none absolute inset-0 z-10" style={{ background: glow }} />}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-white to-sand/50">
            <img
              src={productImage(product.images)}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
              onError={(e) => ((e.currentTarget as HTMLImageElement).src = '/placeholder.svg')}
            />
            {product.featured && (
              <span className="absolute left-3 top-3 rounded-full bg-beam px-2.5 py-1 text-[0.667rem] font-bold uppercase tracking-wider text-graphite">Featured</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-2 p-5" style={tilt ? { transform: 'translateZ(30px)' } : undefined}>
            <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-signal">
              <CategoryIcon slug={product.category_slug} className="h-3.5 w-3.5" /> {product.category_name ?? 'Uncategorised'}
            </span>
            <h3 className="font-display text-lg font-semibold leading-snug text-graphite">{product.name}</h3>
            <p className="line-clamp-2 text-sm text-mist">{product.short_description}</p>
            <div className="mt-auto flex items-center justify-between pt-3">
              <span className="font-display text-sm font-semibold text-graphite">{formatPrice(product.price_inr, product.price_unit)}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full border border-sand text-graphite transition group-hover:border-signal group-hover:bg-signal group-hover:text-white">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-sand bg-paper">
      <div className="aspect-square bg-sand/50" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 rounded bg-sand" />
        <div className="h-5 w-3/4 rounded bg-sand" />
        <div className="h-3 w-full rounded bg-sand/60" />
      </div>
    </div>
  );
}
