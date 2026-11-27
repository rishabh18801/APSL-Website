import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';

// Fallback slideshow, used until slides are added in the admin panel.
// Each slide carries its own headline, typed out as the background changes.
// `lead` is the plain first line, `accent` the gradient second line.
const HERO_SLIDES = [
  {
    src: '/hero/hero-gnss-banner.webp',
    label: 'GNSS Receivers',
    alt: 'Satlab GNSS receivers and CORS reference station with satellite signal arcs',
    lead: 'Measure the world',
    accent: 'with precision',
  },
  {
    src: '/hero/hero-total-stations-banner.webp',
    label: 'Total Stations',
    alt: 'Total stations for accurate construction and engineering surveying',
    lead: 'Accurate surveying',
    accent: 'built to perform',
  },
  {
    src: '/hero/hero-drones-banner.webp',
    label: 'Survey Drones',
    alt: 'Surveyaan mapping drones for aerial surveying and photogrammetry',
    lead: 'Survey every site',
    accent: 'from the sky',
  },
  {
    src: '/hero/hero-software-banner.webp',
    label: 'Survey Software',
    alt: 'Surveying and mapping software suites for CAD, GIS, and road design',
    lead: 'Precision data,',
    accent: 'smarter mapping',
  },
];

const TYPE_SPEED = 55; // ms per character

// Types `text` out one character at a time; returns the full string at once
// when the visitor prefers reduced motion.
function useTypewriter(text: string, animate: boolean) {
  const [count, setCount] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) window.clearInterval(timer);
    }, TYPE_SPEED);
    return () => window.clearInterval(timer);
  }, [text, animate]);

  return text.slice(0, count);
}

export function Hero() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, reduce ? 0 : 140]);
  const fade = useTransform(scrollY, [0, 500], [1, 0]);

  // Slides come from the admin panel; the built-in set stands in while there
  // are none, or if the request fails.
  const { data } = useAsync(() => api.heroSlides().catch(() => []), []);
  const slides =
    data && data.length
      ? data.map((s) => ({ src: s.image, label: s.label, alt: s.alt, lead: s.lead, accent: s.accent }))
      : HERO_SLIDES;

  // Guard the index against a shorter list arriving from the API.
  const index = Math.min(active, slides.length - 1);
  const slide = slides[index];
  const headline = `${slide.lead}\n${slide.accent}`;
  const typed = useTypewriter(headline, !reduce);
  const [typedLead, typedAccent] = typed.split('\n');

  useEffect(() => {
    if (reduce || slides.length < 2) return;
    const timer = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [reduce, slides.length]);

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink-950 pt-16">
      <motion.div style={{ y }} className="absolute inset-0">
        {slides.map((slide, idx) => {
          const isActive = idx === index;
          return (
            <motion.img
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              width={1789}
              height={890}
              loading={idx === 0 ? 'eager' : 'lazy'}
              decoding="async"
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                scale: !reduce && isActive ? 1.03 : 1,
              }}
              transition={{
                opacity: { duration: 1.1, ease: 'easeInOut' },
                scale: { duration: 6, ease: 'easeOut' },
              }}
              className="absolute inset-0 h-full w-full object-cover object-right"
              aria-hidden={!isActive}
            />
          );
        })}
      </motion.div>
      {/* One horizontal scrim: solid cream behind the text, then a short fade
          to fully transparent so the artwork on the right stays untouched.
          The solid band is wider on small screens, where text runs wider. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#04121d_0%,#04121d_56%,rgba(4,18,29,0.72)_76%,rgba(4,18,29,0.25)_100%)] sm:bg-[linear-gradient(to_right,#04121d_0%,#04121d_44%,rgba(4,18,29,0.6)_64%,rgba(4,18,29,0.15)_86%)] lg:bg-[linear-gradient(to_right,#04121d_0%,#04121d_34%,rgba(4,18,29,0.55)_52%,rgba(4,18,29,0.1)_74%)]" />
      {/* Light vertical blend into the page above and below. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink-950/60 via-transparent to-ink-950" />

      <motion.div style={{ opacity: fade }} className="container-x relative z-10 pb-28 pt-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-signal" /> Authorised distributor · Satlab Geosolutions (Sweden) &amp; Surveyaan
          </span>
          <h1 className="mt-6 min-h-[2.2em] font-quote text-4xl leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="sr-only">{`${slide.lead} ${slide.accent}`}</span>
            <span aria-hidden>
              <span className="font-light">{typedLead}</span>
              <br />
              <span className="bg-gradient-to-r from-signal via-signal-400 to-beam bg-clip-text font-extrabold text-transparent">
                {typedAccent}
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl font-quote text-base font-light leading-[1.7] text-white/70 sm:text-[1.0625rem]">
            GNSS receivers, total stations, SLAM scanners, hydrography systems, survey drones and software, supplied, supported and
            rented across India by APSL Solutions LLP, New Delhi.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/products" className="btn-primary px-7 py-3.5 text-base">
              Explore products <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/contact" className="btn border border-white/25 bg-white/5 px-7 py-3.5 text-base text-white transition hover:border-signal hover:text-signal">
              Get enquiry
            </Link>
          </div>
        </motion.div>
      </motion.div>

      <div className="container-x pointer-events-none absolute inset-x-0 bottom-20 z-10 flex items-end justify-between">
        <div className="hidden sm:block" aria-hidden />
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-full border border-white/15 bg-ink-950/70 p-1.5 shadow-sm backdrop-blur-md">
          {slides.map((slide, idx) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActive(idx)}
              aria-label={`Show ${slide.label} background`}
              aria-pressed={idx === index}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                idx === index ? 'bg-signal text-white shadow-sm' : 'text-white/65 hover:text-white'
              }`}
            >
              {slide.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
