/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Animation } from '@lottiefiles/lottie-types';

/**
 * Apply a Lottie stylesheet to a given animation.
 *
 * @param animation - The original Lottie animation.
 * @param lottieStyleSheet - The stylesheet to apply to the animation.
 * @returns A promise that resolves with the styled animation.
 */
export async function applyLottieStyleSheet(animation: Animation, lottieStyleSheet: string): Promise<Animation> {
  // Dynamically load theming related dependencies
  const [{ relottie }, { default: style }] = await Promise.all([
    import('@lottiefiles/relottie/index'),
    import('@lottiefiles/relottie-style'),
  ]);

  const vFile = await relottie().use(style, { lss: lottieStyleSheet }).process(JSON.stringify(animation));

  return JSON.parse(vFile.value) as Animation;
}
