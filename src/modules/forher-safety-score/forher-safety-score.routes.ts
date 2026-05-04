import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { OpenAiSafetyScoreService } from '../../infrastructure/llm/openai/openai-safety-score.service';
import { ForHerSafetyScoreController } from './forher-safety-score.controller';
import { PrismaForHerSafetyScoreRepository } from './forher-safety-score.prisma.repository';
import { ForHerSafetyScoreService } from './forher-safety-score.service';

export const buildForHerSafetyScoreRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerSafetyScoreRepository(prisma);
  const safetyScoreLlmService = new OpenAiSafetyScoreService();
  const service = new ForHerSafetyScoreService(repository, safetyScoreLlmService);
  const controller = new ForHerSafetyScoreController(service);

  router.get('/trips/:tripId/safety-score', controller.getTripSafetyScore);

  return router;
};
