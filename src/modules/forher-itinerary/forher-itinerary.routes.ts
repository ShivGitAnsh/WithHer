import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { ForHerItineraryController } from './forher-itinerary.controller';
import { PrismaForHerItineraryRepository } from './forher-itinerary.prisma.repository';
import { ForHerItineraryService } from './forher-itinerary.service';

export const buildForHerItineraryRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerItineraryRepository(prisma);
  const service = new ForHerItineraryService(repository);
  const controller = new ForHerItineraryController(service);

  router.post('/itineraries/generate', controller.generateItinerary);
  router.get('/itineraries', controller.getLatestItineraryByTripId);
  router.get('/itineraries/:id', controller.getItineraryById);

  return router;
};
