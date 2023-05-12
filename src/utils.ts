/**
 * Copyright 2023 Design Barn Inc.
 */

export const createError = (message: string): Error => {
  const error = new Error(`[dotLottie-player-component] ${message}`);

  return error;
};

export const error = (message: string): void => {
  const error = `[dotLottie-player-component] ${message}`;

  console.error(error);
};

export const warn = (message: string): void => {
  const warning = `[dotLottie-player-component] ${message}`;

  console.warn(warning);
};
