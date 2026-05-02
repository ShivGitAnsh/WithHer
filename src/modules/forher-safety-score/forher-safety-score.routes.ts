import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { GeminiSafetyScoreService } from '../../infrastructure/llm/gemini/gemini-safety-score.service';
import { ForHerSafetyScoreController } from './forher-safety-score.controller';
import { PrismaForHerSafetyScoreRepository } from './forher-safety-score.prisma.repository';
import { ForHerSafetyScoreService } from './forher-safety-score.service';

export const buildForHerSafetyScoreRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerSafetyScoreRepository(prisma);
  const safetyScoreLlmService = new GeminiSafetyScoreService();
  const service = new ForHerSafetyScoreService(repository, safetyScoreLlmService);
  const controller = new ForHerSafetyScoreController(service);

  router.post('/safety-score/generate', controller.generateSafetyScore);
  router.get('/trips/:tripId/safety-score', controller.getTripSafetyScore);

  return router;
};
