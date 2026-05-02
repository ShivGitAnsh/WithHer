import { StatusCodes } from 'http-status-codes';

import { AppError } from './app-error';

type PrismaKnownShape = {
  name: string;
  code: string;
  meta?: { target?: string | string[] };
};

const isPrismaKnownRequestError = (error: unknown): error is PrismaKnownShape =>
  typeof error === 'object' &&
  error !== null &&
  (error as { name?: string }).name === 'PrismaClientKnownRequestError' &&
  typeof (error as { code?: string }).code === 'string';

const formatUniqueTarget = (target: string | string[] | undefined): string => {
  if (Array.isArray(target)) {
    return target.join(', ');
  }
  if (typeof target === 'string') {
    return target;
  }
  return 'value';
};

/**
 * Maps common Prisma client errors to {@link AppError} for consistent HTTP responses.
 * Returns null when the error should fall through to the generic handler.
 */
export const mapPrismaErrorToAppError = (error: unknown): AppError | null => {
  if (!isPrismaKnownRequestError(error)) {
    return null;
  }

  switch (error.code) {
    case 'P2002': {
      const fields = formatUniqueTarget(error.meta?.target);
      const human =
        fields.includes('userId') && fields.includes('phoneNumber')
          ? 'A guardian with this phone number already exists for this user.'
          : fields.includes('userId') && fields.includes('email')
            ? 'A guardian with this email already exists for this user.'
            : `A record with this unique combination already exists (${fields}).`;

      return new AppError(human, StatusCodes.CONFLICT, 'DUPLICATE_ENTRY');
    }

    case 'P2025':
      return new AppError('Record not found', StatusCodes.NOT_FOUND, 'NOT_FOUND');

    case 'P2003':
      return new AppError(
        'Related record is missing or could not be linked',
        StatusCodes.BAD_REQUEST,
        'FOREIGN_KEY_VIOLATION'
      );

    case 'P2011':
      return new AppError(
        'A required field was missing or null',
        StatusCodes.BAD_REQUEST,
        'NULL_CONSTRAINT_VIOLATION'
      );

    default:
      return null;
  }
};
