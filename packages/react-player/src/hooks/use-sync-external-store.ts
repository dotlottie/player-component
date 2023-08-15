/**
 * Copyright 2023 Design Barn Inc.
 */

import { useState, useEffect } from 'react';

type SubscribeFunction = (onStateChange: () => void) => () => void;
type GetSnapshotFunction<T> = () => T;

export const useSyncExternalStore = <T>(
  subscribe: SubscribeFunction,
  getSnapshot: GetSnapshotFunction<T>,
  getDefaultSnapshot: GetSnapshotFunction<T>,
): T => {
  const [state, setState] = useState<T>(() => {
    return getDefaultSnapshot();
  });

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      const newState = getSnapshot();

      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  return state as T;
};
