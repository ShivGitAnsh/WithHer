import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { GeminiItineraryGenerationService } from '../../infrastructure/llm/gemini/gemini-itinerary-generation.service';
import { ForHerItineraryController } from './forher-itinerary.controller';
import { PrismaForHerItineraryRepository } from './forher-itinerary.prisma.repository';
import { ForHerItineraryService } from './forher-itinerary.service';

export const buildForHerItineraryRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerItineraryRepository(prisma);
  const itineraryLlmService = new GeminiItineraryGenerationService();
  const service = new ForHerItineraryService(repository, itineraryLlmService);
  const controller = new ForHerItineraryController(service);

  router.post('/itineraries/generate', controller.generateItinerary);
  router.get('/itineraries', controller.getLatestItineraryByTripId);
  router.get('/itineraries/:id', controller.getItineraryById);

  return router;
};
