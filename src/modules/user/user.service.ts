import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { UserRepository } from './user.repository';
import type { UserProfile } from './user.types';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: string): Promise<UserProfile> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return user;
  }
}
