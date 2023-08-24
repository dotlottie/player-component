/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DependencyList } from 'react';
import { useEffect, useRef } from 'react';

type Callback = () => void | (() => void);

export const useEffectOnce = (effect: Callback, deps: DependencyList): void => {
  const calledRef = useRef(false);

  useEffect(() => {
    let cleanup: void | (() => void);

    if (calledRef.current) {
      cleanup = effect();
    }

    return () => {
      calledRef.current = true;
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
};
