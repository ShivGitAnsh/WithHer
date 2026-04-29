import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import type { HealthService } from './health.service';

export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  getHealth = async (_request: Request, response: Response): Promise<void> => {
    const health = await this.healthService.getHealth();
    const statusCode =
      health.status === 'ok' ? StatusCodes.OK : StatusCodes.SERVICE_UNAVAILABLE;

    response.status(statusCode).json({ data: health });
  };
}
