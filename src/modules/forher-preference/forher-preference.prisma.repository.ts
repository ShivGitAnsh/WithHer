import type { ForHerPreference, PrismaClient } from '@prisma/client';

import type { ForHerPreferenceRepository } from './forher-preference.repository';
import type { UpsertForHerPreferenceRepositoryInput } from './forher-preference.types';

export class PrismaForHerPreferenceRepository
  implements ForHerPreferenceRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    return Boolean(user);
  }

  async findByUserId(userId: string): Promise<ForHerPreference | null> {
    return this.prisma.forHerPreference.findUnique({
      where: { userId }
    });
  }

  async upsert(
    data: UpsertForHerPreferenceRepositoryInput
  ): Promise<ForHerPreference> {
    return this.prisma.forHerPreference.upsert({
      where: {
        userId: data.userId
      },
      create: {
        userId: data.userId,
        enabled: data.enabled
      },
      update: {
        enabled: data.enabled
      }
    });
  }
}
