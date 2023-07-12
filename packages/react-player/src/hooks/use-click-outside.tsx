/**
 * Copyright 2023 Design Barn Inc.
 */

import type { MutableRefObject, RefObject } from 'react';
import { useEffect } from 'react';

export function useClickOutside<T extends HTMLElement>(
  ref: MutableRefObject<T | undefined> | RefObject<T | undefined>,
  callback: () => void,
): void {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent): boolean {
      if (ref.current && event.target && !ref.current.contains(event.target as Node)) {
        if (typeof callback === 'function') {
          callback();

          return true;
        }
      }

      return true;
    }

    document.addEventListener('mousedown', handleClickOutside);

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref]);
}
