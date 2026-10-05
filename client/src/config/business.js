// All business details are configurable. Values below are PLACEHOLDERS
// until verified with the café owner. Override via VITE_* env vars.
const env = import.meta.env;

export const business = {
  name: env.VITE_BUSINESS_NAME || 'BrewSpace Café',
  isSample: env.VITE_SAMPLE_CONTENT !== 'false',
  phone: env.VITE_BUSINESS_PHONE || '+1 555 010 0000',
  whatsapp: env.VITE_BUSINESS_WHATSAPP || '15550100000', // digits only, with country code
  email: env.VITE_BUSINESS_EMAIL || 'hello@example.com',
  address: env.VITE_BUSINESS_ADDRESS || '123 Sample Street, Sample City',
  currency: env.VITE_CURRENCY || 'USD',
  locale: env.VITE_LOCALE || 'en-US',
  social: { instagram: env.VITE_SOCIAL_INSTAGRAM || '', facebook: env.VITE_SOCIAL_FACEBOOK || '' },
  hours: [
    { day: 'Monday', open: '07:00', close: '18:00' },
    { day: 'Tuesday', open: '07:00', close: '18:00' },
    { day: 'Wednesday', open: '07:00', close: '18:00' },
    { day: 'Thursday', open: '07:00', close: '18:00' },
    { day: 'Friday', open: '07:00', close: '20:00' },
    { day: 'Saturday', open: '08:00', close: '20:00' },
    { day: 'Sunday', open: '08:00', close: '17:00' },
  ],
  // Fill these only with owner-approved content. Empty = placeholder shown.
  testimonials: [], // [{ quote, author }]
  offers: [], // [{ title, description }]
  photos: [], // [{ src, alt }] authorized photos only
  // Reservation slots offered in the form (requests only, not live availability)
  timeSlots: ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00'],
};

export const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;
export const telUrl = `tel:${business.phone.replace(/[^+\d]/g, '')}`;
export const whatsappUrl = `https://wa.me/${business.whatsapp.replace(/\D/g, '')}`;

export const formatPrice = (n) =>
  new Intl.NumberFormat(business.locale, { style: 'currency', currency: business.currency }).format(Number(n));
