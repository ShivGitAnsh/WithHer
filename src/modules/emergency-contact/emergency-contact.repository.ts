import type {
  CreateEmergencyContactRepositoryInput,
  EmergencyContactList
} from './emergency-contact.types';

export interface EmergencyContactRepository {
  userExists(userId: string): Promise<boolean>;
  createEmergencyContact(
    input: CreateEmergencyContactRepositoryInput
  ): Promise<EmergencyContactList[number]>;
  findEmergencyContactsByUserId(userId: string): Promise<EmergencyContactList>;
  emergencyContactExists(contactId: string): Promise<boolean>;
  deleteEmergencyContact(contactId: string): Promise<void>;
}
