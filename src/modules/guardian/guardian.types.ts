import type { Guardian } from '@prisma/client';
import { z } from 'zod';

export const createGuardianSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
  fullName: z.string().min(1, 'Full name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1).optional(),
  email: z.string().email('Email must be valid').optional()
});

export const getGuardiansQuerySchema = z.object({
  userId: z.string().min(1, 'User id is required')
});

export type CreateGuardianInput = z.infer<typeof createGuardianSchema>;
export type GetGuardiansQuery = z.infer<typeof getGuardiansQuerySchema>;

export interface CreateGuardianRepositoryInput {
  userId: string;
  fullName: string;
  relationship: string;
  phoneNumber?: string;
  email?: string;
}

export type GuardianList = Guardian[];
