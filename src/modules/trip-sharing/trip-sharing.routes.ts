import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { PrismaTripSharingRepository } from './trip-sharing.prisma.repository';
import { TripSharingController } from './trip-sharing.controller';
import { TripSharingService } from './trip-sharing.service';

export const buildTripSharingRouter = (): Router => {
  const router = Router();

  const tripSharingRepository = new PrismaTripSharingRepository(prisma);
  const tripSharingService = new TripSharingService(tripSharingRepository);
  const tripSharingController = new TripSharingController(tripSharingService);

  router.post('/:tripId/share', tripSharingController.createConsent);

  return router;
};
