import { Router } from 'express';

import { prisma } from '../../infrastructure/database/prisma/client';
import { UserController } from './user.controller';
import { PrismaUserRepository } from './user.prisma.repository';
import { UserService } from './user.service';

export const buildUserRouter = (): Router => {
  const router = Router();

  const userRepository = new PrismaUserRepository(prisma);
  const userService = new UserService(userRepository);
  const userController = new UserController(userService);

  router.get('/:id', userController.getUserById);

  return router;
};
