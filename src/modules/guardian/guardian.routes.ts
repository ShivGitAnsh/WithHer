import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { GuardianController } from './guardian.controller';
import { PrismaGuardianRepository } from './guardian.prisma.repository';
import { GuardianService } from './guardian.service';

export const buildGuardianRouter = (): Router => {
  const router = Router();

  const guardianRepository = new PrismaGuardianRepository(prisma);
  const guardianService = new GuardianService(guardianRepository);
  const guardianController = new GuardianController(guardianService);

  router.post('/', guardianController.createGuardian);
  router.get('/', guardianController.getGuardians);

  return router;
};
