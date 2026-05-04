const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEFAULT_USER_ID?.trim() || null;

export function getConfiguredUserId(): string | null {
  return DEFAULT_USER_ID;
}
