import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, Check, Eye, Gem, Lightbulb, ShieldCheck, Target, Users } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Reveal } from '../components/Reveal';
import { company } from '../lib/company';

const values = [
  { icon: Award, title: 'Quality', text: 'We deliver products and services of the highest standards.' },
  { icon: Gem, title: 'Integrity', text: 'We conduct our business with honesty, transparency and ethics.' },
  { icon: Lightbulb, title: 'Innovation', text: 'We embrace new technologies to deliver smarter solutions.' },
  { icon: Users, title: 'Customer focus', text: 'We build lasting relationships by understanding and exceeding client expectations.' },
  { icon: ShieldCheck, title: 'Reliability', text: 'We stand by our commitments and deliver solutions you can trust.' },
];

const reasons = [
  'Wide range of advanced products',
  'Expert team with industry experience',
  'End-to-end solutions and support',
  'Commitment to quality and customer satisfaction',
];

const collage = [
  '/categories/gnss-receivers.png',
  '/categories/total-stations.png',
  '/categories/survey-drones.png',
  '/categories/surveying-mapping-software.png',
  '/categories/marine-water-resources.png',
  '/categories/lidar-scanners.png',
];

export default function About() {
  useEffect(() => {
    document.title = `About us | ${company.name}`;
  }, []);

  return (
    <>
      <PageHero
        eyebrow="About APSL Solutions"
        title="Innovation. Precision."
        accent="Trust."
        text="APSL Solutions delivers cutting-edge technology and engineering excellence to power industries, build infrastructure and streamline operations."
        image="/hero/hero-total-stations-banner.webp"
        breadcrumb={[{ label: 'Home', to: '/' }, { label: 'About us' }]}
      />

      {/* Story + mission / vision */}
      <section className="container-x py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow"><span className="h-px w-6 bg-signal" /> Our story</span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
              Empowering progress through technology
            </h2>
            <p className="mt-5 leading-relaxed text-copy">
              APSL Solutions was founded with a vision to bring world-class surveying, geospatial and engineering solutions to
              industries across India. As the authorised distributor of Satlab Geosolutions AB (Sweden) and Surveyaan drones, we
              supply instruments and software for land survey, estimation, water networks and geometric design.
            </p>
            <p className="mt-4 leading-relaxed text-copy">
              With a commitment to innovation, quality and customer success, we provide advanced technology, expert support and
              reliable solutions that help our clients achieve accuracy, efficiency and growth in every project.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {company.partners.map((p) => (
                <span key={p} className="glass rounded-full px-4 py-2 text-sm text-graphite">{p}</span>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="divide-y divide-sand rounded-3xl border border-sand bg-paper p-7 shadow-sm">
              <div className="pb-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-signal/10 text-signal">
                  <Target className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">Our mission</h3>
                <p className="mt-2 leading-relaxed text-mist">
                  To provide advanced, reliable and efficient surveying and geospatial solutions that empower our clients to achieve
                  precision, productivity and progress in every project.
                </p>
              </div>
              <div className="pt-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-signal/10 text-signal">
                  <Eye className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">Our vision</h3>
                <p className="mt-2 leading-relaxed text-mist">
                  To be a trusted leader in geospatial and engineering solutions, recognised for innovation, integrity and the ability
                  to create long-term value for our clients and partners.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="container-x pb-14 sm:pb-20">
        <div className="text-center">
          <span className="eyebrow justify-center"><span className="h-px w-6 bg-signal" /> Our values</span>
          <h2 className="mt-4 text-2xl font-semibold sm:text-3xl">The principles that drive us</h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.05}>
              <div className="h-full rounded-3xl border border-sand bg-paper p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-signal/50 hover:shadow-lg">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-signal/10 text-signal">
                  <v.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-display text-sm font-bold uppercase tracking-wider text-graphite">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-mist">{v.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-x pb-14 sm:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="eyebrow"><span className="h-px w-6 bg-signal" /> Why choose APSL Solutions</span>
            <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
              Your trusted partner in surveying &amp; geospatial solutions
            </h2>
            <p className="mt-5 leading-relaxed text-copy">
              We combine advanced technology, domain expertise and dedicated support to deliver solutions that ensure accuracy,
              efficiency and long-term success.
            </p>
            <ul className="mt-6 grid gap-3">
              {reasons.map((r) => (
                <li key={r} className="flex items-start gap-3 text-sm text-copy">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-signal text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {r}
                </li>
              ))}
            </ul>
            <Link to="/products" className="btn-primary mt-8">
              Explore products <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-3 gap-2 overflow-hidden rounded-3xl">
              {collage.map((src) => (
                <img
                  key={src}
                  src={src}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full rounded-xl border border-sand object-cover"
                />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-ink-950 py-12">
        <div className="container-x grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          {company.stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl font-bold text-white sm:text-4xl">{s.value}</div>
              <div className="mt-1 text-xs text-white/60 sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

    </>
  );
}
