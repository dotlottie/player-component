/**
 * Copyright 2023 Design Barn Inc.
 */

export function createError(error: string, prefix = 'dotLottie-common'): Error {
  const err = new Error(`[${prefix}]: ${error}`);

  return err;
}

export function logError(error: string, prefix: string = 'dotLottie-common', ...rest: any[]): void {
  // eslint-disable-next-line no-console
  console.error(`[${prefix}]:`, error, ...rest);
}

export function logWarning(warning: string, prefix: string = 'dotLottie-common', ...rest: any[]): void {
  // eslint-disable-next-line no-console
  console.warn(`[${prefix}]:`, warning, ...rest);
}

export function getLastPathSegment(url: string = ''): string {
  const trimmedUrl = url.trim();
  const pathnameIndex = trimmedUrl.lastIndexOf('/');
  const lastSegmentWithExtension = trimmedUrl.substring(pathnameIndex + 1);

  const dotIndex = lastSegmentWithExtension.indexOf('.');

  if (dotIndex !== -1) {
    return lastSegmentWithExtension.substring(0, dotIndex);
  }

  return lastSegmentWithExtension;
}
