import { z } from 'zod';

const phone = z.string().trim().regex(/^[0-9+()\-\s]{7,20}$/, 'Enter a valid phone number');
const todayISO = () => new Date().toISOString().slice(0, 10);

export const CATEGORIES = ['Hot Coffee', 'Cold Drinks', 'Tea', 'Snacks', 'Desserts'];
export const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];
export const ENQUIRY_STATUSES = ['new', 'read', 'resolved'];

export const reservationCreate = z
  .object({
    customer_name: z.string().trim().min(2, 'Name is too short').max(100),
    phone,
    booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD'),
    booking_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM (24h)'),
    party_size: z.coerce.number().int().min(1).max(20, 'For parties over 20 please call us'),
    website: z.string().max(0).optional(), // honeypot
  })
  .strict()
  .superRefine((v, ctx) => {
    const d = new Date(`${v.booking_date}T00:00:00Z`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== v.booking_date) {
      ctx.addIssue({ code: 'custom', path: ['booking_date'], message: 'Invalid date' });
      return;
    }
    if (v.booking_date < todayISO()) {
      ctx.addIssue({ code: 'custom', path: ['booking_date'], message: 'Date cannot be in the past' });
    }
    const max = new Date(); max.setUTCDate(max.getUTCDate() + 90);
    if (v.booking_date > max.toISOString().slice(0, 10)) {
      ctx.addIssue({ code: 'custom', path: ['booking_date'], message: 'Bookings open up to 90 days ahead' });
    }
  });

export const enquiryCreate = z
  .object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    phone: phone.optional().or(z.literal('').transform(() => undefined)),
    message: z.string().trim().min(5, 'Message is too short').max(2000),
    website: z.string().max(0).optional(), // honeypot
  })
  .strict();

const menuBase = {
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).default(''),
  category: z.enum(CATEGORIES),
  price: z.coerce.number().min(0).max(100000).transform((n) => Math.round(n * 100) / 100),
  image_url: z.string().url().regex(/^https?:\/\//).nullable().optional(),
  available: z.boolean().default(true),
};
export const menuCreate = z.object(menuBase).strict();
export const menuUpdate = z.object(menuBase).partial().strict()
  .refine((v) => Object.keys(v).length > 0, 'No fields to update');

export const reservationPatch = z.object({ status: z.enum(RESERVATION_STATUSES) }).strict();

export const reservationQuery = z.object({
  status: z.enum(RESERVATION_STATUSES).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  q: z.string().trim().max(100).optional(),
});
export const menuQuery = z.object({
  category: z.enum(CATEGORIES).optional(),
  q: z.string().trim().max(100).optional(),
});
export const idParam = z.object({ id: z.string().uuid('Invalid id') });
