import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, Globe2, Phone, Users, CheckCircle2 } from 'lucide-react';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { Hero } from '../components/Hero';
import { Reveal, SectionHeading } from '../components/Reveal';
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard';
import { CategoryIcon } from '../components/CategoryIcon';
import { api } from '../lib/api';
import { useAsync } from '../lib/hooks';
import { company, whatsappLink } from '../lib/company';

// Headline figures, solution groups, promises and industries below all mirror
// the client's live site, apslsolutions.co.in. (Typos in the original copy —
// "dta", "Accurte", "Continiously", "lsting" — have been corrected.)
const stats = company.stats;

const solutions = [
  { title: 'Surveying Instruments', text: 'High-precision instruments for accurate data collection and mapping.', tags: ['Total stations', 'Levels', 'Theodolites'] },
  { title: 'GNSS Solutions', text: 'Advanced GNSS systems for real-time positioning and navigation.', tags: ['RTK', 'CORS', 'DGPS'] },
  { title: 'Scanning Solutions', text: '3D laser scanning systems for detailed and accurate site documentation.', tags: ['SLAM', 'LiDAR', 'Point cloud'] },
  { title: 'Drone Solutions', text: 'Aerial imaging and data capture solutions for smarter decisions.', tags: ['Surveyaan', 'Photogrammetry', 'PPK'] },
  { title: 'Software Solutions', text: 'Powerful software for design, analysis and project management.', tags: ['AutoPlotter', 'AutoRoads', 'GIS'] },
  { title: 'Marine & Water Resources', text: 'Echo sounders, sonar and unmanned boats for hydrographic survey.', tags: ['Echo sounder', 'USV', 'Sonar'] },
];

// `slug` matches the section anchors on the Industries page.
const industries = [
  { title: 'Construction & Infrastructure', img: '/industries/construction.png', slug: 'construction' },
  { title: 'Mining & Quarrying', img: '/industries/mining.png', slug: 'mining' },
  { title: 'Oil, Gas & Energy', img: '/industries/energy.png', slug: 'energy' },
  { title: 'Highways & Transport', img: '/industries/highways.png', slug: 'highways' },
  { title: 'Surveying & Mapping', img: '/industries/mapping.png', slug: 'mapping' },
  { title: 'Water Resources & Environment', img: '/industries/water.png', slug: 'water' },
];

function Marquee() {
  const items = [
    { label: 'GNSS Receivers', img: '/uploads/satlab-sl900-gnss-receiver.png' },
    { label: 'Total Stations', img: '/uploads/satlab-slt12-total-station.png' },
    { label: 'Levelling Instruments', img: '/uploads/satlab-sal32-automatic-level.png' },
    { label: 'Digital Theodolites', img: '/uploads/sdt2-electronic-digital-theodolite.png' },
    { label: 'LiDAR & SLAM Scanners', img: '/uploads/lixel-x1-handheld-slam-scanner.png' },
    { label: 'Survey Drones', img: '/uploads/surveyaan-surveying-and-mapping-drone.png' },
    { label: 'Echo Sounders', img: '/uploads/es-224-dual-frequency-echo-sounder.png' },
    { label: 'Hydro Boats', img: '/uploads/hydro-boat-1200.png' },
    { label: 'AutoPlotter Software', img: '/uploads/autoplotter-gis-plus-software.png' },
  ];
  return (
    <div className="relative overflow-hidden py-6" aria-hidden>
      <div className="flex w-max animate-marquee items-center gap-14 whitespace-nowrap sm:gap-20">
        {[...items, ...items].map((item, i) => (
          <img
            key={i}
            src={item.img}
            alt=""
            title={item.label}
            loading="lazy"
            decoding="async"
            className="h-24 w-24 shrink-0 cursor-pointer object-contain transition-transform duration-300 ease-out hover:scale-125 sm:h-28 sm:w-28 lg:h-32 lg:w-32"
          />
        ))}
      </div>
    </div>
  );
}

const CATEGORY_BG: Record<string, string> = {
  'gnss-receivers': '/categories/gnss-receivers.png',
  'total-stations': '/categories/total-stations.png',
  'levelling-instruments': '/categories/levelling-instruments.png',
  theodolites: '/categories/theodolites.png',
  'lidar-scanners': '/categories/lidar-scanners.png',
  'survey-drones': '/categories/survey-drones.png',
  'marine-water-resources': '/categories/marine-water-resources.png',
  'echo-sounders': '/categories/echo-sounders.png',
  'surveying-mapping-software': '/categories/surveying-mapping-software.png',
};

function Categories() {
  const { data } = useAsync(() => api.categories(), []);
  return (
    <section className="container-x py-14 sm:py-20">
      <SectionHeading eyebrow="Catalogue" title={<>Everything a survey team needs</>} text="From positioning to processing, explore instruments by category." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(data ?? []).map((c, i) => {
          const bg = CATEGORY_BG[c.slug];
          return (
            <Reveal key={c.id} delay={i * 0.05}>
              <Link
                to={`/products?category=${c.slug}`}
                className="group relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-3xl border border-sand bg-paper p-6 shadow-sm transition hover:-translate-y-1 hover:border-signal/50 hover:shadow-lg"
              >
                {bg && (
                  <>
                    <img
                      src={bg}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-right-bottom transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-paper/95 via-paper/75 to-paper/15" />
                    <div className="absolute inset-0 bg-gradient-to-b from-paper/65 via-transparent to-paper/30" />
                  </>
                )}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-signal/10 blur-2xl transition group-hover:bg-signal/25" />
                <span className="relative z-10 grid h-12 w-12 place-items-center rounded-2xl bg-signal/10 text-signal backdrop-blur-sm">
                  <CategoryIcon slug={c.slug} className="h-6 w-6" />
                </span>
                <h3 className="relative z-10 mt-5 text-lg font-semibold">{c.name}</h3>
                <p className="relative z-10 mt-2 max-w-[85%] text-sm text-copy/80">{c.description}</p>
                <span className="relative z-10 mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-signal">
                  {c.product_count} product{c.product_count === 1 ? '' : 's'} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Featured() {
  const { data, loading, error } = useAsync(() => api.products({ featured: true }), []);
  return (
    <section className="relative py-14 sm:py-20">
      <div className="grid-bg absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
      <div className="container-x relative">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Featured" title="Flagship instruments" />
          <Reveal>
            <Link to="/products" className="btn-ghost">View all products <ArrowRight className="h-4 w-4" /></Link>
          </Reveal>
        </div>
        {error && <p className="mt-10 text-red-600">Could not load products: {error}</p>}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading && Array.from({ length: 3 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          {data?.slice(0, 6).map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solutions() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['8%', '-8%']);
  return (
    <section id="solutions" ref={ref} className="scroll-mt-16 overflow-hidden py-14 sm:py-20">
      <div className="container-x">
        <SectionHeading eyebrow="Our solutions" title="Technology that powers every project" text="We help you pick the right instrument stack for the job, and stay with you after delivery." />
      </div>
      <motion.div style={{ x }} className="container-x mt-10 grid gap-5 md:grid-cols-2">
        {solutions.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.06}>
            <div className="group relative h-full overflow-hidden rounded-3xl border border-sand bg-gradient-to-br from-paper to-cream p-7 shadow-sm">
              <span className="font-display text-5xl font-bold text-ink-900/10 transition group-hover:text-signal/25">0{i + 1}</span>
              <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
              <p className="mt-3 text-mist">{s.text}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <span key={t} className="rounded-full border border-sand px-3 py-1 text-xs text-copy">{t}</span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </motion.div>
    </section>
  );
}

function Rental() {
  return (
    <section id="rental" className="container-x scroll-mt-16 py-12">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2rem] border border-signal/25 bg-gradient-to-br from-signal/10 via-paper to-beam/20 p-8 sm:p-14">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-signal/20 blur-3xl" />
          <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <span className="eyebrow"><span className="h-px w-6 bg-signal" /> Equipment rental</span>
              <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Need it for one project?</h2>
              <p className="mt-4 max-w-xl text-mist">
                Survey equipment rental across India, available with a trained operator. Total stations, GNSS and more, on daily or project terms.
              </p>
              <ul className="mt-6 grid gap-2 text-sm text-copy sm:grid-cols-2">
                {['Pan-India service', 'Operator available', 'Calibrated instruments', 'Flexible duration'].map((t) => (
                  <li key={t} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-signal" /> {t}</li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <a href={whatsappLink('Hi APSL, I would like to rent survey equipment.')} target="_blank" rel="noreferrer" className="btn bg-[#25D366] py-3.5 text-base text-white shadow-[0_8px_24px_-10px_rgba(37,211,102,0.9)] hover:bg-[#1EBE5B]">
                <WhatsAppIcon className="h-5 w-5" /> Ask on WhatsApp
              </a>
              <a href={company.phoneHref} className="btn-ghost py-3.5 text-base"><Phone className="h-5 w-5" /> {company.phoneDisplay}</a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Industries() {
  return (
    <section id="industries" className="container-x scroll-mt-16 py-14 sm:py-20">
      <SectionHeading
        eyebrow="Industries we serve"
        title="Smart solutions for every industry"
        text="From city infrastructure to open-cast mines and river surveys, our instruments work where the data matters."
      />
      <Reveal>
        <Link to="/industries" className="btn-ghost mt-6">
          Explore all industries <ArrowRight className="h-4 w-4" />
        </Link>
      </Reveal>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind, i) => (
          <Reveal key={ind.title} delay={(i % 3) * 0.07}>
            <Link
              to={`/industries#${ind.slug}`}
              className="group relative block h-56 overflow-hidden rounded-3xl border border-sand shadow-sm transition duration-300 hover:-translate-y-1 hover:border-signal/50 hover:shadow-lg"
            >
              <img
                src={ind.img}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/45 to-transparent" />
              <h3 className="absolute inset-x-0 bottom-0 flex items-center gap-2 p-5 text-lg font-semibold text-white">
                {ind.title}
                <ArrowRight className="h-4 w-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
              </h3>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Hero />
      <section className="container-x relative z-10 -mt-10 grid grid-cols-2 overflow-hidden rounded-3xl border border-sand bg-paper shadow-sm lg:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} className="relative flex flex-col items-center justify-center bg-paper px-5 py-4 text-center sm:px-6 sm:py-5">
            {/* short divider between columns, not a full-height rule */}
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute left-0 top-1/2 h-9 w-px -translate-y-1/2 bg-sand ${i % 2 === 0 ? 'hidden lg:block' : ''}`}
              />
            )}
            <div className="font-display text-2xl font-bold text-graphite sm:text-3xl">{s.value}</div>
            <div className="mt-1 text-xs text-mist sm:text-sm">{s.label}</div>
          </Reveal>
        ))}
      </section>
      <div className="mt-12"><Marquee /></div>
      <Categories />
      <Featured />
      <Solutions />
      <Industries />
      <Rental />
      <section className="container-x pb-10">
        <div className="flex flex-col items-center gap-2 text-center text-xs text-mist sm:flex-row sm:justify-center sm:gap-6">
          <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" /> Exports worldwide</span>
          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> 11–25 specialists</span>
          <span>GSTIN {company.gst}</span>
        </div>
      </section>
    </>
  );
}
