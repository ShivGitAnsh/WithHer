import { Router } from 'express';

import { buildGuardianRouter } from '../../../modules/guardian/guardian.routes';
import { buildHealthRouter } from '../../../modules/health/health.routes';
import { buildTripRouter } from '../../../modules/trip/trip.routes';
import { buildTripSharingRouter } from '../../../modules/trip-sharing/trip-sharing.routes';

export const buildApiRouter = (): Router => {
  const router = Router();

  router.use('/guardians', buildGuardianRouter());
  router.use('/health', buildHealthRouter());
  router.use('/trips', buildTripRouter());
  router.use('/trips', buildTripSharingRouter());

  return router;
};
