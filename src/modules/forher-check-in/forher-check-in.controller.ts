import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { ForHerCheckInService } from './forher-check-in.service';
import {
  checkInRuleIdParamsSchema,
  createCheckInRuleSchema,
  tripCheckInRuleParamsSchema
} from './forher-check-in.types';

export class ForHerCheckInController {
  constructor(private readonly service: ForHerCheckInService) {}

  createCheckInRule = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripCheckInRuleParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const parsedBody = createCheckInRuleSchema.safeParse(request.body);

    if (!parsedBody.success) {
      throw new AppError(
        parsedBody.error.issues[0]?.message ?? 'Invalid check-in rule payload',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const rule = await this.service.createCheckInRule(parsedParams.data.tripId, parsedBody.data);

    response.status(StatusCodes.CREATED).json({ data: rule });
  };

  getCheckInRules = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = tripCheckInRuleParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid trip id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const rules = await this.service.getCheckInRules(parsedParams.data.tripId);

    response.status(StatusCodes.OK).json({ data: rules });
  };

  evaluateRule = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = checkInRuleIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid check-in rule id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const result = await this.service.evaluateRule(parsedParams.data.id);

    response.status(StatusCodes.OK).json({ data: result });
  };
}
