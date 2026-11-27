// Company details used across the site. Edit here to update everywhere.
// Contact details, tagline and office hours below are taken from the client's
// live site, apslsolutions.co.in (contact-us page and site footer).
export const company = {
  name: 'APSL Solutions LLP',
  short: 'APSL Solutions',
  tagline: 'Innovative Solutions, Intelligent Technology, Infinite Possibilities.',
  established: 2022,
  city: 'New Delhi, Delhi, India',
  address: {
    line1: 'Ground Floor, 4A, Hasanpur',
    line2: 'New Delhi - 110092, Delhi, India',
    full: 'APSL Solutions LLP, Ground Floor, 4A, Hasanpur, New Delhi - 110092, Delhi, India',
  },
  hours: 'Mon – Sat, 09:30 AM to 06:30 PM',
  phoneDisplay: '+91 79427 06158',
  phoneHref: 'tel:+917942706158',
  // WhatsApp sales line: every WhatsApp link on the site goes here.
  whatsappDisplay: '+91 84481 71650',
  whatsapp: 'https://wa.me/918448171650',
  email: 'info@apslsolutions.co.in',
  emailHref: 'mailto:info@apslsolutions.co.in',
  gst: '07ABZFA3461F1Z6',
  iec: 'ABZFA3461F',
  ceo: 'Pankaj Kr. Malik',
  partners: ['Satlab Geosolutions AB (Sweden)', 'Surveyaan Drones'],
  // Headline figures shown on the live site's home and about pages.
  // Social profiles shown in the footer. Paste the full URL to switch an
  // icon on; leave a value empty and that icon is not rendered.
  socials: {
    linkedin: '',
    facebook: '',
    instagram: '',
    youtube: '',
  },
  // Ordered smallest to largest.
  stats: [
    { value: '10+', label: 'Years of Experience' },
    { value: '50+', label: 'Expert Professionals' },
    { value: '1000+', label: 'Happy Clients' },
    { value: '5000+', label: 'Projects Completed' },
  ],
};

export function whatsappLink(text: string, base: string = company.whatsapp) {
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Pre-filled WhatsApp message for a single product, sent to the sales line. */
export function productWhatsappLink(p: { name: string; brand?: string | null; category_name?: string | null; priceText?: string }) {
  const lines = [
    `Hi ${company.short}, I'd like a quote for this product:`,
    '',
    `Product: ${p.name}`,
    p.brand ? `Brand: ${p.brand}` : '',
    p.category_name ? `Category: ${p.category_name}` : '',
    p.priceText ? `Listed price: ${p.priceText}` : '',
    typeof window !== 'undefined' ? `Link: ${window.location.href}` : '',
    '',
    'Please share price, availability and delivery time.',
  ].filter(Boolean);
  return whatsappLink(lines.join('\n'));
}
