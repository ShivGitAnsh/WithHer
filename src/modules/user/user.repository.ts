import type { UserProfile } from './user.types';

export interface UserRepository {
  findUserById(userId: string): Promise<UserProfile | null>;
}
