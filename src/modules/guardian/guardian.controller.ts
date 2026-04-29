import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { GuardianService } from './guardian.service';
import { createGuardianSchema, getGuardiansQuerySchema } from './guardian.types';

export class GuardianController {
  constructor(private readonly guardianService: GuardianService) {}

  createGuardian = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = createGuardianSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid guardian payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const guardian = await this.guardianService.createGuardian(parsedBody.data);

    response.status(StatusCodes.CREATED).json({ data: guardian });
  };

  getGuardians = async (request: Request, response: Response): Promise<void> => {
    const parsedQuery = getGuardiansQuerySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      throw new AppError(
        parsedQuery.error.issues[0]?.message ?? 'Invalid guardian query',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const guardians = await this.guardianService.getGuardiansByUserId(parsedQuery.data.userId);

    response.status(StatusCodes.OK).json({ data: guardians });
  };
}
