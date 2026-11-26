import { Satellite, Crosshair, Ruler, Compass, ScanLine, Waves, Radio, Plane, Code2, Package } from 'lucide-react';

const ICONS: Record<string, typeof Satellite> = {
  'gnss-receivers': Satellite,
  'total-stations': Crosshair,
  'levelling-instruments': Ruler,
  'level-instruments': Ruler,
  theodolites: Compass,
  'lidar-scanners': ScanLine,
  'slam-scanners': ScanLine,
  'survey-drones': Plane,
  drones: Plane,
  'marine-water-resources': Waves,
  hydrography: Waves,
  'echo-sounders': Radio,
  'surveying-mapping-software': Code2,
  software: Code2,
};

export function CategoryIcon({ slug, className }: { slug: string | null | undefined; className?: string }) {
  const Icon = (slug && ICONS[slug]) || Package;
  return <Icon className={className} aria-hidden />;
}
