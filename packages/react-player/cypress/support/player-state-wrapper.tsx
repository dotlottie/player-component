/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayerState } from 'common';
import React, { useRef, useState } from 'react';
import type { ReactNode } from 'react';

export const PlayerStateWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
  const lottieRef = useRef<unknown>();
  const [state, setState] = useState<DotLottiePlayerState>();

  function onEvent(): void {
    const currentState = lottieRef.current?.getState?.();

    if (!currentState) return;
    setState(currentState);
  }

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        {state &&
          Object.keys(state || {}).map((key) => {
            return (
              <label
                key={key}
                style={{
                  display: 'flex',

                  fontSize: '10px',
                }}
              >
                <span>{key}:::</span>
                <input
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '10px',
                  }}
                  disabled
                  key={key}
                  name={key}
                  data-cy={key}
                  value={state[key]}
                />
              </label>
            );
          })}
      </div>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        return React.cloneElement<any>(child, {
          onEvent,
          lottieRef,
        });
      })}
    </div>
  );
};
