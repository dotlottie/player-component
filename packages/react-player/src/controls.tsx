/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import React, { useContext, useMemo, useState } from 'react';

import { DotLottieContext } from './react-player';

const AVAILABLE_BUTTONS = ['play', 'stop', 'loop'] as const;

interface ControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  buttons?: Array<typeof AVAILABLE_BUTTONS[number]>;
  show?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ buttons = AVAILABLE_BUTTONS, ...props }) => {
  const { currentState, dotLottiePlayer, frame, loop, seeker } = useContext(DotLottieContext);

  const [isLoop, setIsLoop] = useState(loop);
  const [_prevState, setPrevState] = useState(PlayerState.Loading);
  const isPlaying = useMemo(() => {
    return currentState === PlayerState.Playing;
  }, [currentState]);

  const isPaused = useMemo(() => {
    return currentState === PlayerState.Paused;
  }, [currentState]);

  const isStopped = useMemo(() => {
    return currentState === PlayerState.Stopped;
  }, [currentState]);

  function seek(value: number | string, nextState: PlayerState): void {
    if (!dotLottiePlayer) return;
    let frameValue = value;

    if (typeof frameValue === 'number') {
      frameValue = Math.round(frameValue);
    }

    // Extract frame number from either number or percentage value
    const matches = /^(\d+)(%?)$/u.exec(frameValue.toString());

    if (!matches) {
      return;
    }

    // Calculate and set the frame number
    const nextFrame = matches[2] === '%' ? (dotLottiePlayer.totalFrames * Number(matches[1])) / 100 : matches[1];

    // Set seeker to new frame number
    if (nextFrame === undefined) return;
    // Send lottie player to the new frame
    if (nextState === PlayerState.Playing) {
      dotLottiePlayer.goToAndPlay(nextFrame, true);
    } else {
      dotLottiePlayer.goToAndStop(nextFrame, true);
      dotLottiePlayer.pause();
    }
  }

  function handleSeekChange(event: React.FormEvent<HTMLInputElement>): void {
    if (!dotLottiePlayer || !Number(event.currentTarget.value)) {
      return;
    }
    const newFrame: number = (Number(event.currentTarget.value) / 100) * dotLottiePlayer.totalFrames;

    seek(newFrame, currentState);
  }

  function togglePlay(): void {
    if (!dotLottiePlayer) return;
    if (currentState === PlayerState.Playing) {
      dotLottiePlayer.pause();
    } else {
      dotLottiePlayer.play();
    }
  }

  function setLooping(value: boolean): void {
    if (dotLottiePlayer) {
      setIsLoop(value);
      dotLottiePlayer.setLoop(value);
    }
  }

  return (
    <div aria-label="lottie-animation-controls" className="toolbar" {...props}>
      {buttons.includes('play') && (
        <button
          onClick={togglePlay}
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
          onClick={(): void => dotLottiePlayer?.stop()}
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
        onInput={(event): void => handleSeekChange(event)}
        onMouseDown={(): void => {
          setPrevState(currentState);
          dotLottiePlayer?.freeze();
        }}
        onMouseUp={(): void => {
          seek(frame || 0, _prevState);
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
            setLooping(!isLoop);
          }}
          className={isLoop ? 'active' : ''}
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
