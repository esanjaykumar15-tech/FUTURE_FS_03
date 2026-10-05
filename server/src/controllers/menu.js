import { HttpError } from '../middleware/errors.js';
import { safeSearch } from '../services/db.js';

export const menuController = (db) => ({
  async list(req, res, next) {
    try {
      const { category, q } = req.valid?.query ?? {};
      let query = db.from('menu_items').select('*').order('category').order('name');
      if (category) query = query.eq('category', category);
      if (q && safeSearch(q)) {
        const s = safeSearch(q);
        query = query.or(`name.ilike.%${s}%,description.ilike.%${s}%`);
      }
      const { data, error } = await query;
      if (error) throw new HttpError(500, 'Could not load menu');
      res.json({ data });
    } catch (e) { next(e); }
  },

  async get(req, res, next) {
    try {
      const { data, error } = await db.from('menu_items').select('*').eq('id', req.params.id).maybeSingle();
      if (error) throw new HttpError(500, 'Could not load menu item');
      if (!data) throw new HttpError(404, 'Menu item not found');
      res.json({ data });
    } catch (e) { next(e); }
  },

  async create(req, res, next) {
    try {
      const { data, error } = await db.from('menu_items').insert(req.body).select().single();
      if (error) throw new HttpError(500, 'Could not create menu item');
      res.status(201).json({ data });
    } catch (e) { next(e); }
  },

  async update(req, res, next) {
    try {
      const { data, error } = await db.from('menu_items').update(req.body).eq('id', req.params.id).select().maybeSingle();
      if (error) throw new HttpError(500, 'Could not update menu item');
      if (!data) throw new HttpError(404, 'Menu item not found');
      res.json({ data });
    } catch (e) { next(e); }
  },

  async remove(req, res, next) {
    try {
      const { data, error } = await db.from('menu_items').delete().eq('id', req.params.id).select();
      if (error) throw new HttpError(500, 'Could not delete menu item');
      if (!data?.length) throw new HttpError(404, 'Menu item not found');
      res.status(204).end();
    } catch (e) { next(e); }
  },
});
