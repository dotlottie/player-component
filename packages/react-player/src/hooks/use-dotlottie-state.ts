/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayerState } from '@dotlottie/common';
import { DEFAULT_STATE } from '@dotlottie/common';
import { useCallback, useSyncExternalStore } from 'react';

import { useDotLottieContext } from '../providers';

export type Unsubscribe = () => void;
export type Subscribe = (onStateChange: () => void) => Unsubscribe;

export function useDotLottieState<T>(selector: (state: DotLottiePlayerState) => T): T {
  const dotlottiePlayer = useDotLottieContext();

  const getSelection = useCallback(() => {
    return selector(dotlottiePlayer.getState());
  }, [selector, dotlottiePlayer]);

  const subscribe: Subscribe = (listener: () => void) => {
    return dotlottiePlayer.state.subscribe(listener);
  };

  const getServerSnapshot = (): T => {
    return selector(DEFAULT_STATE);
  };

  return useSyncExternalStore(subscribe, getSelection, getServerSnapshot);
}
