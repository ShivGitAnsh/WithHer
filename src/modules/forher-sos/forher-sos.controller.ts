import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerSosService } from './forher-sos.service';
import { getSosCaseParamsSchema, triggerSosSchema } from './forher-sos.types';

export class ForHerSosController {
  constructor(private readonly forHerSosService: ForHerSosService) {}

  triggerSos = async (request: Request, response: Response): Promise<void> => {
    const parsedBody = triggerSosSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid SOS payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const result = await this.forHerSosService.triggerSos(parsedBody.data.tripId);

    response.status(StatusCodes.OK).json({ data: result });
  };

  getSosCase = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = getSosCaseParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid SOS case id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const result = await this.forHerSosService.getSosCase(parsedParams.data.caseId);

    response.status(StatusCodes.OK).json({ data: result });
  };
}
