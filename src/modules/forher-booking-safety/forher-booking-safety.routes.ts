import { Router } from 'express';

import { ForHerBookingSafetyController } from './forher-booking-safety.controller';
import { ForHerBookingSafetyService } from './forher-booking-safety.service';

export const buildForHerBookingSafetyRouter = (): Router => {
  const router = Router();

  const service = new ForHerBookingSafetyService();
  const controller = new ForHerBookingSafetyController(service);

  router.post('/flight-options/rank', controller.rankFlightOptions);
  router.post('/hotel-options/rank', controller.rankHotelOptions);

  return router;
};
