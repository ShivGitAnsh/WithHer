import type { ForHerPreference } from '@prisma/client';

import type { UpsertForHerPreferenceRepositoryInput } from './forher-preference.types';

export interface ForHerPreferenceRepository {
  userExists(userId: string): Promise<boolean>;
  findByUserId(userId: string): Promise<ForHerPreference | null>;
  upsert(data: UpsertForHerPreferenceRepositoryInput): Promise<ForHerPreference>;
}
