import type { Trip, User } from '@prisma/client';
import { z } from 'zod';

export const userIdParamsSchema = z.object({
  id: z.string().min(1, 'User id is required')
});

export type UserIdParams = z.infer<typeof userIdParamsSchema>;

export type UserProfileResponse = Pick<
  User,
  'id' | 'email' | 'fullName' | 'phoneNumber' | 'createdAt' | 'updatedAt'
>;

export type TestingContextTripSummary = Pick<
  Trip,
  'id' | 'userId' | 'title' | 'destination' | 'status' | 'startDate' | 'endDate'
>;

export interface UserTestingContextResponse {
  user: UserProfileResponse;
  trips: TestingContextTripSummary[];
}
