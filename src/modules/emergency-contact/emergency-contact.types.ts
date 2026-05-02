import type { EmergencyContact } from '@prisma/client';
import { z } from 'zod';

export const createEmergencyContactSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
  fullName: z.string().min(1, 'Full name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  isPrimary: z.boolean().optional(),
  notes: z.string().max(500).optional()
});

export const getEmergencyContactsQuerySchema = z.object({
  userId: z.string().min(1, 'User id is required')
});

export const deleteEmergencyContactParamsSchema = z.object({
  id: z.string().min(1, 'Emergency contact id is required')
});

export type CreateEmergencyContactInput = z.infer<typeof createEmergencyContactSchema>;
export type GetEmergencyContactsQuery = z.infer<typeof getEmergencyContactsQuerySchema>;
export type DeleteEmergencyContactParams = z.infer<typeof deleteEmergencyContactParamsSchema>;

export interface CreateEmergencyContactRepositoryInput {
  userId: string;
  fullName: string;
  relationship: string;
  phoneNumber: string;
  isPrimary: boolean;
  notes?: string;
}

export type EmergencyContactList = EmergencyContact[];
