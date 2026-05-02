import { Router } from 'express';

import { ForHerBookingSafetyService } from '../forher-booking-safety/forher-booking-safety.service';
import { ForHerListingSafetyController } from './forher-listing-safety.controller';
import { StaticForHerListingSafetyRepository } from './forher-listing-safety.static.repository';
import { ForHerListingSafetyService } from './forher-listing-safety.service';

export const buildForHerListingSafetyRouter = (): Router => {
  const router = Router();

  const repository = new StaticForHerListingSafetyRepository();
  const bookingSafetyService = new ForHerBookingSafetyService();
  const service = new ForHerListingSafetyService(repository, bookingSafetyService);
  const controller = new ForHerListingSafetyController(service);

  router.get('/listings/:listingId/safety-score', controller.getListingSafetyScore);

  return router;
};
