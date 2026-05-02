import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { EmergencyContactController } from './emergency-contact.controller';
import { PrismaEmergencyContactRepository } from './emergency-contact.prisma.repository';
import { EmergencyContactService } from './emergency-contact.service';

export const buildEmergencyContactRouter = (): Router => {
  const router = Router();

  const repository = new PrismaEmergencyContactRepository(prisma);
  const service = new EmergencyContactService(repository);
  const controller = new EmergencyContactController(service);

  router.post('/', controller.createEmergencyContact);
  router.get('/', controller.getEmergencyContacts);
  router.delete('/:id', controller.deleteEmergencyContact);

  return router;
};
