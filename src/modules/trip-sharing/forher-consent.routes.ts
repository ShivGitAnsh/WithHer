import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { PrismaTripSharingRepository } from './trip-sharing.prisma.repository';
import { TripSharingController } from './trip-sharing.controller';
import { TripSharingService } from './trip-sharing.service';

export const buildForHerConsentRouter = (): Router => {
  const router = Router();

  const repository = new PrismaTripSharingRepository(prisma);
  const service = new TripSharingService(repository);
  const controller = new TripSharingController(service);

  router.get('/consents', controller.getConsents);
  router.post('/consents', controller.createForHerConsent);
  router.delete('/consents/:id', controller.revokeConsent);
  router.get('/trips/:tripId/trust-log', controller.getTrustLog);

  return router;
};
