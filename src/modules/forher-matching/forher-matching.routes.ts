import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { ForHerMatchingController } from './forher-matching.controller';
import { PrismaForHerMatchingRepository } from './forher-matching.prisma.repository';
import { ForHerMatchingService } from './forher-matching.service';

export const buildForHerMatchingRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerMatchingRepository(prisma);
  const service = new ForHerMatchingService(repository);
  const controller = new ForHerMatchingController(service);

  router.get('/trips/:tripId/matching/profile', controller.getProfile);
  router.post('/trips/:tripId/matching/opt-in', controller.optIn);
  router.get('/trips/:tripId/matching/candidates', controller.getCandidates);
  router.post('/matches/:matchId/connect', controller.connect);

  return router;
};
