import { HttpError } from '../middleware/errors.js';
import { safeSearch } from '../services/db.js';

export const reservationController = (db) => ({
  async create(req, res, next) {
    try {
      const { customer_name, phone, booking_date, booking_time, party_size } = req.body;
      // status is NEVER taken from the client — always starts as pending.
      const { data, error } = await db
        .from('reservations')
        .insert({ customer_name, phone, booking_date, booking_time, party_size, status: 'pending' })
        .select('id, booking_date, booking_time, party_size, status')
        .single();
      if (error?.code === '23505') {
        throw new HttpError(409, 'A request for this phone number, date and time was already received.');
      }
      if (error) throw new HttpError(500, 'Could not save your reservation request');
      res.status(201).json({
        data,
        message: 'Your reservation request has been received and is pending. It is not confirmed until the café contacts you.',
      });
    } catch (e) { next(e); }
  },

  async list(req, res, next) {
    try {
      const { status, date, q } = req.valid?.query ?? {};
      let query = db.from('reservations').select('*')
        .order('booking_date', { ascending: true }).order('booking_time', { ascending: true });
      if (status) query = query.eq('status', status);
      if (date) query = query.eq('booking_date', date);
      if (q && safeSearch(q)) {
        const s = safeSearch(q);
        query = query.or(`customer_name.ilike.%${s}%,phone.ilike.%${s}%`);
      }
      const { data, error } = await query;
      if (error) throw new HttpError(500, 'Could not load reservations');
      res.json({ data });
    } catch (e) { next(e); }
  },

  async updateStatus(req, res, next) {
    try {
      const { data, error } = await db.from('reservations')
        .update({ status: req.body.status }).eq('id', req.params.id).select().maybeSingle();
      if (error) throw new HttpError(500, 'Could not update reservation');
      if (!data) throw new HttpError(404, 'Reservation not found');
      res.json({ data });
    } catch (e) { next(e); }
  },
});
