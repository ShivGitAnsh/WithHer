import pino from 'pino';

import { env } from './env';

export const logger = pino({
  name: env.APP_NAME,
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'production'
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true
          }
        }
});
