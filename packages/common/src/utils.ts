/**
 * Copyright 2023 Design Barn Inc.
 */

export function createError(error: string): Error {
  const err = new Error(`[dotlottie-common]: ${error}`);

  return err;
}

export function logError(error: string, ...rest: any[]): void {
  console.error(`[dotlottie-common]:`, error, ...rest);
}

export function logWarning(warning: string, ...rest: any[]): void {
  console.warn(`[dotlottie-common]:`, warning, ...rest);
}
