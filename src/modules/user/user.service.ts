import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { UserRepository } from './user.repository';
import type { UserProfileResponse, UserTestingContextResponse } from './user.types';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(userId: string): Promise<UserProfileResponse> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return user;
  }

  async getTestingContext(): Promise<UserTestingContextResponse> {
    const context = await this.userRepository.findTestingContext();

    if (!context) {
      throw new AppError(
        'No trip-backed testing user found',
        StatusCodes.NOT_FOUND,
        'TESTING_CONTEXT_NOT_FOUND'
      );
    }

    return context;
  }
}
