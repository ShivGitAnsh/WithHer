import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { TwilioService } from '../../infrastructure/communications/twilio/twilio.service';
import { NotificationService } from '../notification/notification.service';
import { ForHerSosController } from './forher-sos.controller';
import { PrismaForHerSosRepository } from './forher-sos.prisma.repository';
import { ForHerSosService } from './forher-sos.service';

export const buildForHerSosRouter = (): Router => {
  const router = Router();

  const repository = new PrismaForHerSosRepository(prisma);
  const twilioService = new TwilioService();
  const notificationService = new NotificationService(twilioService);
  const service = new ForHerSosService(repository, notificationService);
  const controller = new ForHerSosController(service);

  router.post('/sos/trigger', controller.triggerSos);
  router.get('/sos/:caseId', controller.getSosCase);

  return router;
};
