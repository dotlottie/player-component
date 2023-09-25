/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayerState } from '@dotlottie/common';
import React, { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { PlayerEvents } from '../../';
import type { DotLottieCommonPlayer } from '../../';

export const PlayerStateWrapper: React.FC<{
  children: ReactNode;
  onRef?: (ref: DotLottieCommonPlayer | null) => void;
}> = ({ children, onRef }) => {
  const dotLottiePlayerRef = useRef<DotLottieCommonPlayer | null>(null);
  const [state, setState] = useState<DotLottiePlayerState>();

  function onEvent(event: PlayerEvents): void {
    const currentState = dotLottiePlayerRef.current?.getState();

    if (event === PlayerEvents.Ready) {
      onRef?.(dotLottiePlayerRef.current);
    }

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
          ref: dotLottiePlayerRef,
        });
      })}
    </div>
  );
};
