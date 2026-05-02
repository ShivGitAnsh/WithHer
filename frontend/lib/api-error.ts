/** Thrown when the backend returns a non-2xx JSON error or an unexpected payload. */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

/** Short toast title when the API returned a known error code. */
export const getApiErrorTitle = (
  error: unknown,
  defaults: { base: string; duplicate?: string; notFound?: string }
): string => {
  if (error instanceof ApiError) {
    if (error.code === 'DUPLICATE_ENTRY') {
      return defaults.duplicate ?? 'Already exists';
    }
    if (error.code === 'NOT_FOUND') {
      return defaults.notFound ?? 'Not found';
    }
  }
  return defaults.base;
};
