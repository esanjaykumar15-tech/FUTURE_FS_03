import { HttpError } from './errors.js';

export const validate = (schema, source = 'body') => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }));
    return next(new HttpError(400, 'Validation failed', details));
  }
  if (source === 'body') req.body = result.data;
  else req.valid = { ...(req.valid || {}), [source]: result.data };
  next();
};
