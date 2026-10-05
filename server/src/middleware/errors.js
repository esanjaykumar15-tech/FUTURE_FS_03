export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFound = (req, _res, next) =>
  next(new HttpError(404, `Route not found: ${req.method} ${req.path}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({ error: { message: 'Request body too large' } });
  }
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { message: 'Malformed JSON' } });
  }
  // Safe log: message only — no request bodies, tokens or customer data.
  console.error('[error]', err?.message);
  res.status(500).json({ error: { message: 'Internal server error' } });
}
