import { Router } from 'express';

import { ForHerCheckInController } from './forher-check-in.controller';
import { createForHerCheckInService } from './forher-check-in.factory';

export const buildForHerCheckInRouter = (): Router => {
  const router = Router();

  const service = createForHerCheckInService();
  const controller = new ForHerCheckInController(service);

  router.post('/trips/:tripId/check-in-rules', controller.createCheckInRule);
  router.get('/trips/:tripId/check-in-rules', controller.getCheckInRules);
  router.post('/check-in-rules/:id/evaluate', controller.evaluateRule);

  return router;
};
