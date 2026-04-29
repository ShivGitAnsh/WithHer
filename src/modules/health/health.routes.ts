import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { HealthController } from './health.controller';
import { PrismaHealthRepository } from './health.prisma.repository';
import { HealthService } from './health.service';

export const buildHealthRouter = (): Router => {
  const router = Router();

  const healthRepository = new PrismaHealthRepository(prisma);
  const healthService = new HealthService(healthRepository);
  const healthController = new HealthController(healthService);

  router.get('/', healthController.getHealth);

  return router;
};
