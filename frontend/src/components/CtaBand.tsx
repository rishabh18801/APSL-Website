import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Orange closing band shown site-wide, directly above the footer. */
export function CtaBand() {
  return (
    <section className="bg-signal">
      <div className="container-x flex flex-col items-center justify-between gap-6 py-10 text-center sm:flex-row sm:text-left">
        <div>
          <span className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Let's build the future together
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Ready to start your next project?</h2>
          <p className="mt-2 text-white/85">Partner with APSL Solutions for reliable technology and expert support.</p>
        </div>
        <Link to="/contact" className="btn shrink-0 bg-ink-950 px-7 py-3.5 text-base text-white hover:bg-ink-900">
          Get in touch <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
