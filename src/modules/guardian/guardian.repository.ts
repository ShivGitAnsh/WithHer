import type { Guardian } from '@prisma/client';

import type { CreateGuardianRepositoryInput } from './guardian.types';

export interface GuardianRepository {
  userExists(userId: string): Promise<boolean>;
  createGuardian(data: CreateGuardianRepositoryInput): Promise<Guardian>;
  findGuardiansByUserId(userId: string): Promise<Guardian[]>;
}
