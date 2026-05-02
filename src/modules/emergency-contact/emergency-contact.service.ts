import { StatusCodes } from 'http-status-codes';
import type { EmergencyContact } from '@prisma/client';

import { AppError } from '../../shared/errors/app-error';
import type { EmergencyContactRepository } from './emergency-contact.repository';
import type { CreateEmergencyContactInput, EmergencyContactList } from './emergency-contact.types';

export class EmergencyContactService {
  constructor(private readonly emergencyContactRepository: EmergencyContactRepository) {}

  async createEmergencyContact(input: CreateEmergencyContactInput): Promise<EmergencyContact> {
    const userExists = await this.emergencyContactRepository.userExists(input.userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.emergencyContactRepository.createEmergencyContact({
      userId: input.userId,
      fullName: input.fullName,
      relationship: input.relationship,
      phoneNumber: input.phoneNumber,
      isPrimary: input.isPrimary ?? false,
      notes: input.notes
    });
  }

  async getEmergencyContactsByUserId(userId: string): Promise<EmergencyContactList> {
    const userExists = await this.emergencyContactRepository.userExists(userId);

    if (!userExists) {
      throw new AppError('User not found', StatusCodes.NOT_FOUND, 'USER_NOT_FOUND');
    }

    return this.emergencyContactRepository.findEmergencyContactsByUserId(userId);
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    const exists = await this.emergencyContactRepository.emergencyContactExists(contactId);

    if (!exists) {
      throw new AppError(
        'Emergency contact not found',
        StatusCodes.NOT_FOUND,
        'EMERGENCY_CONTACT_NOT_FOUND'
      );
    }

    await this.emergencyContactRepository.deleteEmergencyContact(contactId);
  }
}
