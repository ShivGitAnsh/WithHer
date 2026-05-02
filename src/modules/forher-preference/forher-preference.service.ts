import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerPreferenceRepository } from './forher-preference.repository';
import type {
  ForHerPreferenceResponse,
  UpdateForHerPreferenceInput
} from './forher-preference.types';

export class ForHerPreferenceService {
  constructor(
    private readonly forHerPreferenceRepository: ForHerPreferenceRepository
  ) {}

  async getPreference(userId: string): Promise<ForHerPreferenceResponse> {
    await this.assertUserExists(userId);

    const preference = await this.forHerPreferenceRepository.findByUserId(userId);

    return {
      userId,
      enabled: preference?.enabled ?? false
    };
  }

  async updatePreference(
    input: UpdateForHerPreferenceInput
  ): Promise<ForHerPreferenceResponse> {
    await this.assertUserExists(input.userId);

    const preference = await this.forHerPreferenceRepository.upsert({
      userId: input.userId,
      enabled: input.enabled
    });

    return {
      userId: preference.userId,
      enabled: preference.enabled
    };
  }

  private async assertUserExists(userId: string): Promise<void> {
    const userExists = await this.forHerPreferenceRepository.userExists(userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }
  }
}
