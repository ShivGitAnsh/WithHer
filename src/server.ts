import type { Server } from 'node:http';

import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './infrastructure/database/prisma/client';
import { createApp } from './app';
import { createForHerCheckInService } from './modules/forher-check-in/forher-check-in.factory';
import { ForHerCheckInScheduler } from './modules/forher-check-in/forher-check-in.scheduler';

const app = createApp();
const checkInScheduler = new ForHerCheckInScheduler(createForHerCheckInService(), {
  enabled: env.CHECK_IN_SCHEDULER_ENABLED,
  intervalMs: env.CHECK_IN_SCHEDULER_INTERVAL_MS,
  batchSize: env.CHECK_IN_SCHEDULER_BATCH_SIZE
});

let server: Server;

const startServer = async (): Promise<void> => {
  try {
    checkInScheduler.start();

    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          environment: env.NODE_ENV
        },
        `HTTP server running on port ${env.PORT}`
      );
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  logger.info({ signal }, 'Shutting down application');

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }

  await checkInScheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', () => {
  void shutdown('SIGINT');
});

process.on('SIGTERM', () => {
  void shutdown('SIGTERM');
});

void startServer();
