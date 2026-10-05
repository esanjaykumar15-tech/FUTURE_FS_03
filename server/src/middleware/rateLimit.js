import rateLimit from 'express-rate-limit';

const json = (message) => ({ error: { message } });
const base = { standardHeaders: true, legacyHeaders: false };

// Created per app instance so counters are isolated (important for tests).
export function createLimiters({ publicMax = 10 } = {}) {
  return {
    publicSubmissionLimiter: rateLimit({
      ...base, windowMs: 15 * 60 * 1000, limit: publicMax,
      message: json('Too many submissions. Please try again later.'),
    }),
    generalLimiter: rateLimit({
      ...base, windowMs: 60 * 1000, limit: 120,
      message: json('Too many requests. Please slow down.'),
    }),
    adminLimiter: rateLimit({
      ...base, windowMs: 15 * 60 * 1000, limit: 300,
      message: json('Too many requests. Please slow down.'),
    }),
  };
}
