/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayerState } from '@dotlottie/common';
import { DEFAULT_STATE } from '@dotlottie/common';
import { useCallback } from 'react';

import { useDotLottieContext } from '../providers';

import { useSyncExternalStore } from './use-sync-external-store';

export type Unsubscribe = () => void;
export type Subscribe = (onStateChange: () => void) => Unsubscribe;
const noop = (): void => {
  //
};

export function useDotLottieState<T>(selector: (state: DotLottiePlayerState) => T): T | undefined {
  const dotLottiePlayer = useDotLottieContext();

  const getSelection = useCallback(() => {
    if (dotLottiePlayer === null) return undefined;

    return selector(dotLottiePlayer.getState());
  }, [selector, dotLottiePlayer]);

  const subscribe = useCallback<Subscribe>(
    (listener: () => void) => {
      if (dotLottiePlayer === null) return noop;

      return dotLottiePlayer.state.subscribe(listener);
    },
    [dotLottiePlayer],
  );

  const getServerSnapshot = (): T => {
    return selector(DEFAULT_STATE);
  };

  return useSyncExternalStore(subscribe, getSelection, getServerSnapshot);
}
