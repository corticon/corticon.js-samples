export function isUnauthorizedError(error: Error): boolean {
  // Always return false in development mode since authentication is disabled
  return false;
}