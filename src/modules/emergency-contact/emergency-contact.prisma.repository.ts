import type { PrismaClient } from '@prisma/client';

import type { EmergencyContactRepository } from './emergency-contact.repository';
import type { CreateEmergencyContactRepositoryInput, EmergencyContactList } from './emergency-contact.types';

export class PrismaEmergencyContactRepository implements EmergencyContactRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async userExists(userId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    return Boolean(user);
  }

  async createEmergencyContact(
    input: CreateEmergencyContactRepositoryInput
  ): Promise<EmergencyContactList[number]> {
    return this.prisma.emergencyContact.create({
      data: input
    });
  }

  async findEmergencyContactsByUserId(userId: string): Promise<EmergencyContactList> {
    return this.prisma.emergencyContact.findMany({
      where: { userId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
  }

  async emergencyContactExists(contactId: string): Promise<boolean> {
    const contact = await this.prisma.emergencyContact.findUnique({
      where: { id: contactId },
      select: { id: true }
    });

    return Boolean(contact);
  }

  async deleteEmergencyContact(contactId: string): Promise<void> {
    await this.prisma.emergencyContact.delete({
      where: { id: contactId }
    });
  }
}
