import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { GuardianInviteService } from './guardian-invite.service';
import { guardianInviteTokenParamsSchema } from './guardian-invite.types';

export class GuardianInviteController {
  constructor(private readonly service: GuardianInviteService) {}

  getInvite = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = guardianInviteTokenParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid invite token',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const invite = await this.service.getInviteByToken(parsedParams.data.token);
    response.status(StatusCodes.OK).json({ data: invite });
  };

  acceptInvite = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = guardianInviteTokenParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid invite token',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const invite = await this.service.acceptInvite(parsedParams.data.token);
    response.status(StatusCodes.OK).json({ data: invite });
  };
}
