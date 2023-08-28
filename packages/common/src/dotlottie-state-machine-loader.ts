/**
 * Copyright 2023 Design Barn Inc.
 */

import type { LottieStateMachine } from '@dotlottie/dotlottie-js';

import type { DotLottiePlayer } from './dotlottie-player';
import type { DotLottieStateMachineManager } from './state/dotlottie-state-machine-manager';
import { createError } from './utils';

/**
 * Load all the state machines in to XState.
 *
 * @param stateMachines - The state machines to load.
 * @param player - The dotLottie player object.
 * @returns A promise that resolves DotLottie state machine manager.
 */
export async function loadStateMachines(
  stateMachines: LottieStateMachine[],
  player: DotLottiePlayer,
): Promise<DotLottieStateMachineManager> {
  // Dynamically load state machine related dependencies
  const [{ DotLottieStateMachineManager }] = await Promise.all([import('./state/dotlottie-state-machine-manager')]);

  if (!stateMachines.length) {
    throw createError('No state machines available inside this .lottie!');
  }

  return new DotLottieStateMachineManager(stateMachines, player);
}
