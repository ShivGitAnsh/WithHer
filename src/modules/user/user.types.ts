import type { User } from '@prisma/client';
import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.string().min(1, 'User id is required')
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export type UserProfile = Pick<
  User,
  'id' | 'email' | 'fullName' | 'phoneNumber' | 'createdAt' | 'updatedAt'
>;
