import type { ForHerPreference } from '@prisma/client';
import { z } from 'zod';

export const getForHerPreferenceQuerySchema = z.object({
  userId: z.string().min(1, 'User id is required')
});

export const updateForHerPreferenceSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
  enabled: z.boolean()
});

export type GetForHerPreferenceQuery = z.infer<typeof getForHerPreferenceQuerySchema>;
export type UpdateForHerPreferenceInput = z.infer<typeof updateForHerPreferenceSchema>;

export interface UpsertForHerPreferenceRepositoryInput {
  userId: string;
  enabled: boolean;
}

export interface ForHerPreferenceResponse {
  userId: string;
  enabled: boolean;
}

export type ForHerPreferenceRecord = ForHerPreference;
