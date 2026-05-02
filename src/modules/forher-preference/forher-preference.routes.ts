import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { ForHerPreferenceController } from './forher-preference.controller';
import { PrismaForHerPreferenceRepository } from './forher-preference.prisma.repository';
import { ForHerPreferenceService } from './forher-preference.service';

export const buildForHerPreferenceRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerPreferenceRepository(prisma);
  const service = new ForHerPreferenceService(repository);
  const controller = new ForHerPreferenceController(service);

  router.get('/preferences', controller.getPreference);
  router.put('/preferences', controller.updatePreference);

  return router;
};
