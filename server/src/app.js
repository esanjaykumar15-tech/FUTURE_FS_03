import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { buildRouter } from './routes/index.js';
import { createLimiters } from './middleware/rateLimit.js';
import { notFound, errorHandler, HttpError } from './middleware/errors.js';

export function createApp({ db, env, limits }) {
  const app = express();
  const limiters = createLimiters(limits);
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind Render/Vercel proxies so rate limiting sees real IPs

  const origins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);
  app.use(helmet());
  app.use(cors({
    origin(origin, cb) {
      if (!origin || origins.includes(origin)) return cb(null, true);
      cb(new HttpError(403, 'Origin not allowed'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use('/api', limiters.generalLimiter, buildRouter(db, limiters));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
