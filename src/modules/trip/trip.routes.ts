import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { TwilioService } from '../../infrastructure/communications/twilio/twilio.service';
import { PrismaForHerCheckInRepository } from '../forher-check-in/forher-check-in.prisma.repository';
import { ForHerCheckInService } from '../forher-check-in/forher-check-in.service';
import { OpenAiSafetyBriefService } from '../../infrastructure/llm/openai/openai-safety-brief.service';
import { NotificationService } from '../notification/notification.service';
import { PrismaTripEventNotificationRepository } from '../trip-event-notification/trip-event-notification.prisma.repository';
import { TripEventNotificationHandlerService } from '../trip-event-notification/trip-event-notification.handler';
import { TripController } from './trip.controller';
import { PrismaTripRepository } from './trip.prisma.repository';
import { TripService } from './trip.service';

export const buildTripRouter = (): Router => {
  const router = Router();

  const tripRepository = new PrismaTripRepository(prisma);
  const twilioService = new TwilioService();
  const notificationService = new NotificationService(twilioService);
  const safetyBriefLlmService = new OpenAiSafetyBriefService();
  const forHerCheckInRepository = new PrismaForHerCheckInRepository(prisma);
  const forHerCheckInService = new ForHerCheckInService(
    forHerCheckInRepository,
    notificationService
  );
  const tripEventNotificationRepository = new PrismaTripEventNotificationRepository(prisma);
  const tripEventNotificationHandler = new TripEventNotificationHandlerService(
    tripEventNotificationRepository,
    notificationService
  );
  const tripService = new TripService(
    tripRepository,
    tripEventNotificationHandler,
    safetyBriefLlmService,
    forHerCheckInService
  );
  const tripController = new TripController(tripService);

  router.get('/', tripController.getTrips);
  router.post('/', tripController.createTrip);
  router.post('/:tripId/safety-brief', tripController.generateSafetyBrief);
  router.get('/:tripId/family-dashboard', tripController.getFamilyDashboard);
  router.get('/:id', tripController.getTripById);
  router.post('/:id/events', tripController.addTripEvent);

  return router;
};
