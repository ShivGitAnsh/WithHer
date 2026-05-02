import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { GuardianInviteController } from './guardian-invite.controller';
import { PrismaGuardianInviteRepository } from './guardian-invite.prisma.repository';
import { GuardianInviteService } from './guardian-invite.service';

export const buildGuardianInviteRouter = (): Router => {
  const router = Router();

  const repository = new PrismaGuardianInviteRepository(prisma);
  const service = new GuardianInviteService(repository);
  const controller = new GuardianInviteController(service);

  router.get('/guardian-invites/:token', controller.getInvite);
  router.post('/guardian-invites/:token/accept', controller.acceptInvite);

  return router;
};
