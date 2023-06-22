/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import React, { useMemo } from 'react';

import { useDotLottieState } from './hooks/use-dotlottie-state';
import { useDotLottieContext } from './providers';

const AVAILABLE_BUTTONS = ['play', 'stop', 'loop'] as const;

interface ControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  buttons?: Array<typeof AVAILABLE_BUTTONS[number]>;
  show?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ buttons = AVAILABLE_BUTTONS, ...props }) => {
  const dotLottiePlayer = useDotLottieContext();

  const loop = useDotLottieState((state) => state.loop);
  const currentState = useDotLottieState((state) => state.currentState);
  const seeker = useDotLottieState((state) => state.seeker);

  const isPlaying = useMemo(() => {
    return currentState === PlayerState.Playing;
  }, [currentState]);

  const isPaused = useMemo(() => {
    return currentState === PlayerState.Paused;
  }, [currentState]);

  const isStopped = useMemo(() => {
    return currentState === PlayerState.Stopped;
  }, [currentState]);

  return (
    <div aria-label="lottie-animation-controls" className="toolbar" {...props}>
      {buttons.includes('play') && (
        <button
          onClick={(): void => dotLottiePlayer.togglePlay()}
          className={`${isPlaying || isPaused ? 'active' : ''}`}
          style={{ alignItems: 'center' }}
          // tabindex={0}
          aria-label="play-pause"
        >
          {isPlaying ? (
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z" />
            </svg>
          ) : (
            <svg width="24" height="24" aria-hidden="true" focusable="false">
              <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
            </svg>
          )}
        </button>
      )}
      {buttons.includes('stop') && (
        <button
          onClick={(): void => dotLottiePlayer.stop()}
          className={`${isStopped ? 'active' : ''}`}
          style={{ alignItems: 'center' }}
          aria-label="stop"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M6 6h12v12H6V6z" />
          </svg>
        </button>
      )}
      <input
        className="seeker"
        type="range"
        min={0}
        step={0}
        max={100}
        value={seeker || 0}
        onInput={(event): void => dotLottiePlayer.seek(String(event.currentTarget.value).concat('%'))}
        onMouseDown={(): void => {
          dotLottiePlayer.freeze();
        }}
        onMouseUp={(): void => {
          dotLottiePlayer.unfreeze();
        }}
        aria-valuemin={1}
        aria-valuemax={100}
        role="slider"
        aria-valuenow={seeker}
        aria-label="lottie-seek-input"
      />

      {buttons.includes('loop') && (
        <button
          onClick={(): void => {
            dotLottiePlayer.toggleLoop();
          }}
          className={loop ? 'active' : ''}
          style={{ alignItems: 'center' }}
          aria-label="loop-toggle"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z" />
          </svg>
        </button>
      )}
    </div>
  );
};
