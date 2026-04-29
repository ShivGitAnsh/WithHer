import type { Guardian, PrismaClient } from '@prisma/client';

import type { GuardianRepository } from './guardian.repository';
import type { CreateGuardianRepositoryInput } from './guardian.types';

export class PrismaGuardianRepository implements GuardianRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    return Boolean(user);
  }

  async createGuardian(data: CreateGuardianRepositoryInput): Promise<Guardian> {
    return this.prisma.guardian.create({
      data
    });
  }

  async findGuardiansByUserId(userId: string): Promise<Guardian[]> {
    return this.prisma.guardian.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'asc'
      }
    });
  }
}
