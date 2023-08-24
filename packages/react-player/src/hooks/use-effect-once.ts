/**
 * Copyright 2023 Design Barn Inc.
 */

import { useEffect, useRef } from 'react';

type Callback = () => void | (() => void);

export const useEffectOnce = (effect: Callback): void => {
  const calledRef = useRef(false);

  useEffect(() => {
    let cleanup: void | (() => void);

    if (!calledRef.current) {
      cleanup = effect();
      calledRef.current = true;
    }

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  });
};
