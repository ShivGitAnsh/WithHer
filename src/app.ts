import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler } from './infrastructure/http/middlewares/error-handler';
import { notFoundHandler } from './infrastructure/http/middlewares/not-found-handler';
import { buildApiRouter } from './infrastructure/http/routes';

/** `CORS_ORIGIN=*` allows any origin; otherwise one URL or comma-separated URLs (e.g. Vite + Next dev). */
const resolveCorsOrigin = (): boolean | string | string[] => {
  const raw = env.CORS_ORIGIN.trim();

  if (raw === '*') {
    return true;
  }

  const origins = raw
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (origins.length === 0) {
    return true;
  }

  if (origins.length === 1) {
    return origins[0] as string;
  }

  return origins;
};

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(
    pinoHttp({
      logger
    })
  );
  app.use(helmet());
  app.use(
    cors({
      origin: resolveCorsOrigin()
    })
  );
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(env.API_PREFIX, buildApiRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
