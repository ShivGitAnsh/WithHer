import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { AppError } from '../../shared/errors/app-error';
import type { UserService } from './user.service';
import { userIdParamsSchema } from './user.types';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getTestingContext = async (_request: Request, response: Response): Promise<void> => {
    const context = await this.userService.getTestingContext();

    response.status(StatusCodes.OK).json({ data: context });
  };

  getUserById = async (request: Request, response: Response): Promise<void> => {
    const parsedParams = userIdParamsSchema.safeParse(request.params);

    if (!parsedParams.success) {
      throw new AppError(
        parsedParams.error.issues[0]?.message ?? 'Invalid user id',
        StatusCodes.BAD_REQUEST,
        'VALIDATION_ERROR'
      );
    }

    const user = await this.userService.getUserById(parsedParams.data.id);

    response.status(StatusCodes.OK).json({ data: user });
  };
}
