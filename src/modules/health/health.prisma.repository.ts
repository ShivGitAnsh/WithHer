import type { PrismaClient } from '@prisma/client';

import type { HealthRepository } from './health.repository';
import type { DependencyStatus } from './health.types';

export class PrismaHealthRepository implements HealthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async checkDatabase(): Promise<DependencyStatus> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return 'up';
    } catch {
      return 'down';
    }
  }
}
