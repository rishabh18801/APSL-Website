/** @type {import('tailwindcss').Config} */
/**
 * Brand palette taken from the client's live site, apslsolutions.co.in
 * (their own wp-custom-css block):
 *   #F5660A  primary orange  — buttons / CTAs
 *   #0A2D48  deep navy       — brand dark
 *   #111111  near-black      — headings
 *   #444444  body text
 *   #EADFD7  warm border     — table + card borders
 *   #FFF1E8  cream           — soft tint background
 * Headings and body copy both use Mulish.
 *
 * The site is skinned LIGHT, matching the live site: cream/white surfaces,
 * near-black headings, grey body copy, warm sand borders. The navy `ink` ramp
 * is kept as a brand accent (3D scene, image overlays, tints) rather than as
 * the page background.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand navy ramp, kept for accents, overlays and the 3D scene.
        ink: { 950: '#04121d', 900: '#06192a', 800: '#0a2d48', 700: '#103a5c', 600: '#1a4e77' },
        // Primary action colour.
        signal: { DEFAULT: '#f5660a', 400: '#ff8534', 600: '#d4540a' },
        // Warm secondary highlight.
        beam: { DEFAULT: '#ffb366', 400: '#ffcb99' },
        // Muted body text on light surfaces.
        mist: '#5b6b7a',
        // Light surfaces and text from the live site.
        sand: '#eadfd7',
        cream: '#fff1e8',
        paper: '#ffffff',
        graphite: '#111111',
        copy: '#444444',
      },
      fontFamily: {
        display: ['Mulish', 'system-ui', 'sans-serif'],
        sans: ['Mulish', 'system-ui', 'sans-serif'],
        // Hero quote lockup: light first line, heavy second line.
        quote: ['Mulish', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
      },
      animation: { marquee: 'marquee 40s linear infinite' },
    },
  },
  plugins: [],
};

