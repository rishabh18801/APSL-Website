import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * Dark banner used at the top of inner pages: an ink background with a
 * diagonal photo panel on the right and an orange edge along the cut.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  text,
  image,
  breadcrumb,
  children,
}: {
  eyebrow: string;
  title: string;
  /** Rendered in brand orange after the title. */
  accent?: string;
  text?: string;
  image?: string;
  breadcrumb?: { label: string; to?: string }[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-ink-950 pt-24 sm:pt-28">
      {/* Diagonal photo panel, desktop only so the copy never sits on it. */}
      {image && (
        <div
          className="absolute inset-y-0 right-0 hidden w-[58%] lg:block"
          style={{ clipPath: 'polygon(22% 0, 100% 0, 100% 100%, 0 100%)' }}
          aria-hidden
        >
          <img src={image} alt="" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/55 to-ink-950/25" />
        </div>
      )}
      {/* Orange line along the diagonal */}
      {image && (
        <div
          className="absolute inset-y-0 right-0 hidden w-[58%] lg:block"
          style={{ clipPath: 'polygon(22% 0, 23.2% 0, 1.2% 100%, 0 100%)' }}
          aria-hidden
        >
          <div className="h-full w-full bg-signal" />
        </div>
      )}
      <div className="grid-bg pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden />

      <div className="container-x relative py-14 sm:py-20">
        {breadcrumb && (
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-white/55" aria-label="Breadcrumb">
            {breadcrumb.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.to ? (
                  <Link to={b.to} className="transition hover:text-signal">{b.label}</Link>
                ) : (
                  <span className="text-white/80">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        <span className="inline-flex items-center gap-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-signal">
          {eyebrow} <span className="h-px w-10 bg-signal/60" />
        </span>

        <h1 className="mt-4 max-w-2xl font-quote text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
          {accent && (
            <>
              <br />
              <span className="text-signal">{accent}</span>
            </>
          )}
        </h1>

        {text && <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{text}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
