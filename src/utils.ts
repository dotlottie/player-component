/**
 * Copyright 2023 Design Barn Inc.
 */

export const createError = (message: string): Error => {
  const error = new Error(`[dotLottie] ${message}`);

  return error;
};

export const logError = (message: string): void => {
  const error = `[dotLottie] ${message}`;

  console.error(error);
};

export const logWarning = (message: string): void => {
  const warning = `[dotLottie] ${message}`;

  console.warn(warning);
};
