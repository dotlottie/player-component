/**
 * Copyright 2023 Design Barn Inc.
 */

import { isAudioAsset } from '@dotlottie/dotlottie-js';
import type { Animation, Asset } from '@lottiefiles/lottie-types';

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

export function getFilename(url: string = ''): string {
  const trimmedUrl = url.trim();
  const pathnameIndex = trimmedUrl.lastIndexOf('/');
  const lastSegmentWithExtension = trimmedUrl.substring(pathnameIndex + 1);

  const dotIndex = lastSegmentWithExtension.indexOf('.');

  if (dotIndex !== -1) {
    return lastSegmentWithExtension.substring(0, dotIndex);
  }

  return lastSegmentWithExtension;
}

export function isValidLottieJSON(json: Record<string, unknown>): boolean {
  const mandatory: string[] = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h'];

  return mandatory.every((field: string) => Object.prototype.hasOwnProperty.call(json, field));
}

export function lottieContainsAudio(json: Animation): boolean {
  const assets: Asset.Value[] | undefined = json.assets;

  if (assets) {
    return assets.some((asset: Asset.Value) => {
      return isAudioAsset(asset);
    });
  }

  return false;
}

export function isValidLottieString(str: string): boolean {
  try {
    const json = JSON.parse(str);

    return isValidLottieJSON(json);
  } catch (_err) {
    return false;
  }
}

export function getKeyByValue<T extends Record<string, unknown>, V>(object: T, value: V): keyof T {
  const key = Object.keys(object).find((ke) => object[ke] === value);

  if (key === undefined) {
    throw new Error('Value not found in the object.');
  }

  return key;
}
