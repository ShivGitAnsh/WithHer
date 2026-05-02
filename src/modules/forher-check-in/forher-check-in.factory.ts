import { TwilioService } from '../../infrastructure/communications/twilio/twilio.service';
import { prisma } from '../../infrastructure/database/prisma/client';
import { NotificationService } from '../notification/notification.service';
import { PrismaForHerCheckInRepository } from './forher-check-in.prisma.repository';
import { ForHerCheckInService } from './forher-check-in.service';

export const createForHerCheckInService = (): ForHerCheckInService => {
  const repository = new PrismaForHerCheckInRepository(prisma);
  const twilioService = new TwilioService();
  const notificationService = new NotificationService(twilioService);

  return new ForHerCheckInService(repository, notificationService);
};
