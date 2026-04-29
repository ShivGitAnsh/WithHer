import { StatusCodes } from 'http-status-codes';
import type { Guardian } from '@prisma/client';

import { AppError } from '../../shared/errors/app-error';
import type { GuardianRepository } from './guardian.repository';
import type { CreateGuardianInput, GuardianList } from './guardian.types';

export class GuardianService {
  constructor(private readonly guardianRepository: GuardianRepository) {}

  async createGuardian(input: CreateGuardianInput): Promise<Guardian> {
    const userExists = await this.guardianRepository.userExists(input.userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.guardianRepository.createGuardian({
      userId: input.userId,
      fullName: input.fullName,
      relationship: input.relationship,
      phoneNumber: input.phoneNumber,
      email: input.email
    });
  }

  async getGuardiansByUserId(userId: string): Promise<GuardianList> {
    const userExists = await this.guardianRepository.userExists(userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.guardianRepository.findGuardiansByUserId(userId);
  }
}
