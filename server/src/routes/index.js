import { Router } from 'express';
import { z } from 'zod';
import { requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import * as s from '../validation/schemas.js';
import { menuController } from '../controllers/menu.js';
import { reservationController } from '../controllers/reservations.js';
import { enquiryController, summaryController } from '../controllers/enquiries.js';

export function buildRouter(db, { publicSubmissionLimiter, adminLimiter }) {
  const r = Router();
  const menu = menuController(db);
  const reservations = reservationController(db);
  const enquiries = enquiryController(db);
  const summary = summaryController(db);
  const id = validate(s.idParam, 'params');

  r.get('/health', (_req, res) => res.json({ status: 'ok' }));

  // ---- public ----
  r.get('/menu', validate(s.menuQuery, 'query'), menu.list);
  r.get('/menu/:id', id, menu.get);
  r.post('/reservations', publicSubmissionLimiter, validate(s.reservationCreate), reservations.create);
  r.post('/enquiries', publicSubmissionLimiter, validate(s.enquiryCreate), enquiries.create);

  // ---- admin (token + server-side role check on every route) ----
  const admin = Router();
  admin.use(adminLimiter, requireAdmin(db));
  admin.get('/me', (req, res) => res.json({ data: { id: req.user.id, role: 'admin' } }));
  admin.get('/summary', summary.get);
  admin.get('/reservations', validate(s.reservationQuery, 'query'), reservations.list);
  admin.patch('/reservations/:id', id, validate(s.reservationPatch), reservations.updateStatus);
  admin.post('/menu', validate(s.menuCreate), menu.create);
  admin.patch('/menu/:id', id, validate(s.menuUpdate), menu.update);
  admin.delete('/menu/:id', id, menu.remove);
  admin.get('/enquiries', enquiries.list);
  admin.patch('/enquiries/:id', id,
    validate(z.object({ status: z.enum(s.ENQUIRY_STATUSES) }).strict()), enquiries.updateStatus);
  r.use('/admin', admin);

  return r;
}
