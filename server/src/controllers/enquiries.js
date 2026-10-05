import { HttpError } from '../middleware/errors.js';

export const enquiryController = (db) => ({
  async create(req, res, next) {
    try {
      const { name, email, phone, message } = req.body;
      const { error } = await db.from('enquiries').insert({ name, email, phone: phone ?? null, message, status: 'new' });
      if (error) throw new HttpError(500, 'Could not send your message');
      res.status(201).json({ message: 'Thanks! Your message has been received.' });
    } catch (e) { next(e); }
  },

  async list(_req, res, next) {
    try {
      const { data, error } = await db.from('enquiries').select('*').order('created_at', { ascending: false });
      if (error) throw new HttpError(500, 'Could not load enquiries');
      res.json({ data });
    } catch (e) { next(e); }
  },

  async updateStatus(req, res, next) {
    try {
      const { data, error } = await db.from('enquiries')
        .update({ status: req.body.status }).eq('id', req.params.id).select().maybeSingle();
      if (error) throw new HttpError(500, 'Could not update enquiry');
      if (!data) throw new HttpError(404, 'Enquiry not found');
      res.json({ data });
    } catch (e) { next(e); }
  },
});

export const summaryController = (db) => ({
  async get(_req, res, next) {
    try {
      const count = async (table, col, val) => {
        let q = db.from(table).select('id', { count: 'exact', head: true });
        if (col) q = q.eq(col, val);
        const { count: c, error } = await q;
        if (error) throw new HttpError(500, 'Could not load summary');
        return c ?? 0;
      };
      const [menuItems, pendingReservations, newEnquiries] = await Promise.all([
        count('menu_items'), count('reservations', 'status', 'pending'), count('enquiries', 'status', 'new'),
      ]);
      res.json({ data: { menuItems, pendingReservations, newEnquiries } });
    } catch (e) { next(e); }
  },
});
