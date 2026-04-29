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
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN
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
