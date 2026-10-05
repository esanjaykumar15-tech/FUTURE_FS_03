import { HttpError } from './errors.js';

// Verifies the Supabase access token, then checks role = 'admin' in the DB.
// Role is read server-side from `profiles` — never from client-supplied data.
export const requireAdmin = (supabase) => async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) throw new HttpError(401, 'Authentication required');

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data?.user) throw new HttpError(401, 'Invalid or expired token');

    const { data: profile, error: pErr } = await supabase
      .from('profiles').select('role').eq('user_id', data.user.id).maybeSingle();
    if (pErr) throw new HttpError(500, 'Could not verify permissions');
    if (profile?.role !== 'admin') throw new HttpError(403, 'Administrator access required');

    req.user = { id: data.user.id };
    next();
  } catch (e) { next(e); }
};
