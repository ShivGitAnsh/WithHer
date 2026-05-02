import type { UserProfileResponse, UserTestingContextResponse } from './user.types';

export interface UserRepository {
  findUserById(userId: string): Promise<UserProfileResponse | null>;
  findTestingContext(): Promise<UserTestingContextResponse | null>;
}
