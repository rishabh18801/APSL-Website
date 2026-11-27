import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, HardHat, Mountain, Flame, Route, Map, Droplets, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Reveal, SectionHeading } from '../components/Reveal';
import { WhatsAppIcon } from '../components/WhatsAppIcon';
import { company, whatsappLink } from '../lib/company';

type Industry = {
  slug: string;
  title: string;
  icon: LucideIcon;
  img: string;
  summary: string;
  body: string;
  applications: string[];
  equipment: { label: string; to: string }[];
};

/**
 * Sector copy written for APSL: what each industry measures, the problems
 * survey data solves there, and which part of the catalogue fits.
 */
const industries: Industry[] = [
  {
    slug: 'construction',
    title: 'Construction & Infrastructure',
    icon: HardHat,
    img: '/industries/construction.png',
    summary: 'Set out structures accurately the first time and keep every pour, column and level verified against the design.',
    body:
      'On a building or infrastructure site, the cost of a setting-out error grows by the day. Our instruments give site engineers a reliable control network from the first excavation through to handover, so column positions, floor levels and façade lines are checked against the model rather than against assumptions. Robotic total stations let a single engineer set out an entire floor plate, while GNSS rovers tie the site back to national coordinates for approvals and as-built records.',
    applications: [
      'Site control networks and setting out',
      'Excavation depth and formation level checks',
      'Verticality and floor-level verification',
      'As-built surveys and BIM comparison',
      'Volume calculation for earthworks and fill',
    ],
    equipment: [
      { label: 'Total stations', to: '/products?category=total-stations' },
      { label: 'Levelling instruments', to: '/products?category=levelling-instruments' },
      { label: 'GNSS receivers', to: '/products?category=gnss-receivers' },
    ],
  },
  {
    slug: 'mining',
    title: 'Mining & Quarrying',
    icon: Mountain,
    img: '/industries/mining.png',
    summary: 'Measure extracted volumes, monitor bench stability and keep statutory survey records without putting people near a face.',
    body:
      'Mines live and die by volume accuracy: stockpile figures feed royalty calculations, production reporting and haulage planning. Drone photogrammetry covers an open pit in a single flight and produces a point cloud accurate enough to compute volumes to within a couple of percent, with nobody walking the benches. For underground and highwall work, SLAM scanners capture geometry in minutes where a total station traverse would take hours.',
    applications: [
      'Stockpile and extracted-volume measurement',
      'Open-pit and bench progress surveys',
      'Highwall and slope stability monitoring',
      'Haul-road design and grade control',
      'Statutory mine plans and end-of-month reporting',
    ],
    equipment: [
      { label: 'Survey drones', to: '/products?category=survey-drones' },
      { label: 'LiDAR & SLAM scanners', to: '/products?category=lidar-scanners' },
      { label: 'GNSS receivers', to: '/products?category=gnss-receivers' },
    ],
  },
  {
    slug: 'energy',
    title: 'Oil, Gas & Energy',
    icon: Flame,
    img: '/industries/energy.png',
    summary: 'Route pipelines, position plant structures and document brownfield assets where tolerances and safety rules are unforgiving.',
    body:
      'Energy projects combine long linear corridors with dense, congested plant areas. GNSS and CORS infrastructure carry consistent coordinates along a pipeline route across districts, while laser scanning captures existing refinery and substation structures so new steelwork can be prefabricated to fit. Because much of the work sits inside live, hazardous areas, capturing geometry quickly and remotely is a safety measure as much as a survey one.',
    applications: [
      'Pipeline route surveys and alignment sheets',
      'Plant and refinery as-built scanning',
      'Tank calibration and settlement monitoring',
      'Solar and wind farm layout and setting out',
      'Right-of-way and encroachment mapping',
    ],
    equipment: [
      { label: 'LiDAR & SLAM scanners', to: '/products?category=lidar-scanners' },
      { label: 'GNSS receivers', to: '/products?category=gnss-receivers' },
      { label: 'Total stations', to: '/products?category=total-stations' },
    ],
  },
  {
    slug: 'highways',
    title: 'Highways & Transport',
    icon: Route,
    img: '/industries/highways.png',
    summary: 'Survey corridors, design alignments and check pavement geometry across projects that run for hundreds of kilometres.',
    body:
      'A highway project is a survey problem stretched over distance. Drone corridor mapping produces topographic data far faster than ground methods, and that data flows straight into AutoPlotter and AutoRoads for alignment design, cross-sections and earthwork estimation. During construction, GNSS machine guidance and digital levels keep the formation and pavement layers inside specification, and the same data becomes the as-built record at handover.',
    applications: [
      'Corridor topographic surveys and strip plans',
      'Horizontal and vertical alignment design',
      'Cross-sections, earthwork quantities and estimation',
      'Pavement layer and camber verification',
      'Land acquisition and right-of-way plans',
    ],
    equipment: [
      { label: 'Survey drones', to: '/products?category=survey-drones' },
      { label: 'Surveying & mapping software', to: '/products?category=surveying-mapping-software' },
      { label: 'Levelling instruments', to: '/products?category=levelling-instruments' },
    ],
  },
  {
    slug: 'mapping',
    title: 'Surveying & Mapping',
    icon: Map,
    img: '/industries/mapping.png',
    summary: 'Cadastral, topographic and GIS work for survey firms, municipal bodies and government departments.',
    body:
      'For professional survey practices, the instrument is the business. RTK and CORS-based GNSS gives centimetre positioning across a district without a base station on every job, and handheld SLAM scanners capture built-up areas where satellite visibility is poor. Field data comes back into AutoPlotter for plotting, area computation and GIS deliverables, so a crew can close the loop from observation to submitted drawing in a single day.',
    applications: [
      'Cadastral and land-record surveys',
      'Topographic and contour mapping',
      'Urban and village GIS data capture',
      'Control network establishment and CORS',
      'Boundary demarcation and area computation',
    ],
    equipment: [
      { label: 'GNSS receivers', to: '/products?category=gnss-receivers' },
      { label: 'Theodolites', to: '/products?category=theodolites' },
      { label: 'Surveying & mapping software', to: '/products?category=surveying-mapping-software' },
    ],
  },
  {
    slug: 'water',
    title: 'Water Resources & Environment',
    icon: Droplets,
    img: '/industries/water.png',
    summary: 'Bathymetric survey of reservoirs, rivers and ports, plus the catchment data behind irrigation and flood planning.',
    body:
      'Water bodies have to be measured from the surface and below it. Echo sounders paired with GNSS produce depth profiles for dams, canals and harbours, while unmanned survey vessels reach shallow or unsafe water that a crewed boat cannot. The resulting bathymetry drives reservoir capacity studies, dredging quantities and siltation monitoring, and combines with drone topography to give a single model of a catchment from ridge line to riverbed.',
    applications: [
      'Reservoir capacity and siltation surveys',
      'River cross-sections and flood modelling',
      'Port, harbour and channel bathymetry',
      'Dredging volume measurement',
      'Canal and irrigation network surveys',
    ],
    equipment: [
      { label: 'Echo sounders', to: '/products?category=echo-sounders' },
      { label: 'Marine & water resources', to: '/products?category=marine-water-resources' },
      { label: 'Survey drones', to: '/products?category=survey-drones' },
    ],
  },
];

export default function Industries() {
  useEffect(() => {
    document.title = 'Industries we serve | APSL Solutions LLP';
  }, []);

  return (
    <div className="pt-24 sm:pt-32">
      <div className="container-x">
        <SectionHeading
          eyebrow="Industries we serve"
          title="Survey technology, matched to the work"
          text="From city infrastructure to open-cast mines and river surveys, we supply, support and rent the instruments that collect the data each sector depends on."
        />

        {/* Jump links */}
        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap gap-2">
            {industries.map((ind) => (
              <a
                key={ind.slug}
                href={`#${ind.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-sand bg-paper px-4 py-2 text-sm text-graphite shadow-sm transition hover:border-signal/50 hover:text-signal"
              >
                <ind.icon className="h-4 w-4 text-signal" /> {ind.title}
              </a>
            ))}
          </div>
        </Reveal>
      </div>

      {/* Sector sections, alternating image side */}
      <div className="container-x mt-14 space-y-16 sm:mt-20 sm:space-y-24">
        {industries.map((ind, i) => (
          <section key={ind.slug} id={ind.slug} className="scroll-mt-24">
            <div className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-14 ${i % 2 ? 'lg:[&>figure]:order-2' : ''}`}>
              <figure className="relative overflow-hidden rounded-3xl border border-sand shadow-sm">
                <img
                  src={ind.img}
                  alt={ind.title}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  className="aspect-[16/10] w-full object-cover"
                />
              </figure>

              <Reveal delay={0.05}>
                <span className="eyebrow">
                  <ind.icon className="h-4 w-4" /> 0{i + 1}
                </span>
                <h2 className="mt-3 text-2xl font-semibold leading-tight sm:text-3xl">{ind.title}</h2>
                <p className="mt-4 text-lg text-mist">{ind.summary}</p>
                <p className="mt-4 leading-relaxed text-copy">{ind.body}</p>

                <h3 className="mt-7 text-sm font-semibold uppercase tracking-wider text-graphite">Typical applications</h3>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {ind.applications.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-copy">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" /> {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap gap-2">
                  {ind.equipment.map((e) => (
                    <Link
                      key={e.to}
                      to={e.to}
                      className="inline-flex items-center gap-1.5 rounded-full bg-signal/10 px-3.5 py-1.5 text-sm font-medium text-signal transition hover:bg-signal/20"
                    >
                      {e.label} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      {/* Closing call to action */}
      <section className="container-x py-16 sm:py-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] border border-signal/25 bg-gradient-to-br from-signal/10 via-paper to-beam/20 p-8 text-center sm:p-14">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-signal/20 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-semibold sm:text-3xl">Not sure which instrument fits your project?</h2>
              <p className="mx-auto mt-4 max-w-2xl text-mist">
                Tell us the site, the accuracy you need and the deadline. We will recommend a stack you can buy or rent, with a trained
                operator if you need one.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to="/contact" className="btn-primary px-7 py-3.5 text-base">
                  Get enquiry <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappLink('Hi APSL, I would like advice on equipment for my project.')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-[#25D366] px-7 py-3.5 text-base text-white shadow-[0_8px_24px_-10px_rgba(37,211,102,0.9)] hover:bg-[#1EBE5B]"
                >
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp
                </a>
                <a href={company.phoneHref} className="btn-ghost px-7 py-3.5 text-base">
                  <Phone className="h-5 w-5" /> {company.phoneDisplay}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
