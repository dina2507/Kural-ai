export function parseApiError(error: any, fallbackMessage: string): string {
  let errorMessage = error || fallbackMessage;
  if (typeof errorMessage === 'string') {
    try {
      const parsed = JSON.parse(errorMessage);
      if (parsed?.error?.message) {
        return parsed.error.message;
      } else if (parsed?.message) {
        return parsed.message;
      }
    } catch (e) {
      // Not JSON, ignore
    }
  } else if (typeof errorMessage === 'object' && errorMessage !== null) {
    if (errorMessage.error?.message) {
      return errorMessage.error.message;
    } else if (errorMessage.message) {
      return errorMessage.message;
    } else {
      return JSON.stringify(errorMessage);
    }
  }
  return String(errorMessage);
}
