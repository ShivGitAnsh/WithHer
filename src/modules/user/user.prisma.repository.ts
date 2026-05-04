import type { PrismaClient } from '@prisma/client';

import type { UserRepository } from './user.repository';
import type { UserProfile } from './user.types';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findUserById(userId: string): Promise<UserProfile | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }
}
