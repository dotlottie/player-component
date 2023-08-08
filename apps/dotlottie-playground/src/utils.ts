/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieState } from '@dotlottie/dotlottie-js';

import mockState from './assets/mock-state.json';

export const cn = (...args: unknown[]): string => args.filter(Boolean).join(' ');

export function createError(error: string, prefix = 'dotLottie-common'): Error {
  const err = new Error(`[${prefix}]: ${error}`);

  return err;
}

export function logError(error: string, prefix: string = 'dotLottie-common', ...rest: unknown[]): void {
  // eslint-disable-next-line no-console
  console.error(`[${prefix}]:`, error, ...rest);
}

export function logWarning(warning: string, prefix: string = 'dotLottie-common', ...rest: unknown[]): void {
  // eslint-disable-next-line no-console
  console.warn(`[${prefix}]:`, warning, ...rest);
}

export function formatJSON(value: string): string {
  try {
    const res = JSON.parse(value);

    return JSON.stringify(res, null, '\t');
  } catch (error) {
    const errorJson = {
      error,
    };

    return JSON.stringify(errorJson, null, '\t');
  }
}

export function processFilename(fileName: string = ''): string {
  return fileName.replace(/\s+/u, '_').toLowerCase();
}

export function getMockDotLottieState(): DotLottieState {
  // Removing reference
  return JSON.parse(JSON.stringify(mockState));
}

// export function getFilename(url: string = ''): string {
//   const trimmedUrl = url.trim();
//   const pathnameIndex = trimmedUrl.lastIndexOf('/');
//   const lastSegmentWithExtension = trimmedUrl.substring(pathnameIndex + 1);

//   const dotIndex = lastSegmentWithExtension.indexOf('.');

//   if (dotIndex !== -1) {
//     return lastSegmentWithExtension.substring(0, dotIndex);
//   }

//   return lastSegmentWithExtension;
// }

// export function getKeyByValue<T extends Record<string, unknown>, V>(object: T, value: V): keyof T {
//   const key = Object.keys(object).find((ke) => object[ke] === value);

//   if (key === undefined) {
//     throw new Error('Value not found in the object.');
//   }

//   return key;
// }
