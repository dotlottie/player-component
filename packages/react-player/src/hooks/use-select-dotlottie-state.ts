/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayer, DotLottiePlayerState } from '@dotlottie/common';
import { DEFAULT_STATE } from '@dotlottie/common';
import { useCallback, useSyncExternalStore } from 'react';

export type Unsubscribe = () => void;
export type Subscribe = (onStateChange: () => void) => Unsubscribe;

export function useSelectDotLottieState<T>(
  dotLottiePlayer: DotLottiePlayer,
  selector: (state: DotLottiePlayerState) => T,
): T {
  const getSelection = useCallback(() => {
    return selector(dotLottiePlayer.getState());
  }, [selector, dotLottiePlayer]);

  const subscribe: Subscribe = (listener: () => void) => {
    return dotLottiePlayer.state.subscribe(listener);
  };

  const getServerSnapshot = (): T => {
    return selector(DEFAULT_STATE);
  };

  return useSyncExternalStore(subscribe, getSelection, getServerSnapshot);
}
