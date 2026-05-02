import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { EmergencyContactService } from './emergency-contact.service';
import {
  createEmergencyContactSchema,
  deleteEmergencyContactParamsSchema,
  getEmergencyContactsQuerySchema
} from './emergency-contact.types';

export class EmergencyContactController {
  constructor(private readonly emergencyContactService: EmergencyContactService) {}

  createEmergencyContact = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = createEmergencyContactSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid emergency contact payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const contact = await this.emergencyContactService.createEmergencyContact(parsedBody.data);

    response.status(StatusCodes.CREATED).json({ data: contact });
  };

  getEmergencyContacts = async (request: Request, response: Response): Promise<void> => {
    const parsedQuery = getEmergencyContactsQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? 'Invalid emergency contact query',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const contacts = await this.emergencyContactService.getEmergencyContactsByUserId(
      parsedQuery.data.userId
    );

    response.status(StatusCodes.OK).json({ data: contacts });
  };

  deleteEmergencyContact = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = deleteEmergencyContactParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid emergency contact id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    await this.emergencyContactService.deleteEmergencyContact(parsedParams.data.id);

    response.status(StatusCodes.NO_CONTENT).send();
  };
}
