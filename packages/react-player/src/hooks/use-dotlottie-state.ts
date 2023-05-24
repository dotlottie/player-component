/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayerState } from 'common';
import { DEFAULT_STATE } from 'common';
import { useCallback, useSyncExternalStore } from 'react';

import { useDotLottieContext } from '../dotlottie-context';

export type Unsubscribe = () => void;
export type Subscribe = (onStateChange: () => void) => Unsubscribe;

export function useDotLottieState<T>(selector: (state: DotLottiePlayerState) => T): T {
  const dotlottiePlayer = useDotLottieContext();

  const getSelection = useCallback(() => {
    if (!dotlottiePlayer) return selector(DEFAULT_STATE);

    return selector(dotlottiePlayer.getState());
  }, [selector, dotlottiePlayer]);

  const subscribe: Subscribe = (listener: () => void) => {
    if (dotlottiePlayer) {
      return dotlottiePlayer.state.subscribe(listener);
    }

    return () => null;
  };

  return useSyncExternalStore(subscribe, getSelection);
}
