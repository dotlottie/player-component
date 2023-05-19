/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererSettings, PlayMode } from 'common';
import { PlayerState } from 'common';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';

import { useDotLottiePlayer } from './hooks/use-dotlottie-player';
import type { DotLottieRefProps } from './hooks/use-dotlottie-player';

export interface DotLottiePlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  activeAnimationId?: string;
  autoplay?: boolean;
  background?: string;
  className?: string;
  controls?: boolean;
  direction?: 1 | -1;
  intermission?: number;
  loop?: number | boolean;
  lottieRef: MutableRefObject<DotLottieRefProps | undefined>;
  mode?: PlayMode;
  onComplete?: () => void;
  onDataFail?: () => void;
  onDataReady?: () => void;
  onEnterFrame?: (currentFrame: number, seeker: number) => void;
  onError?: () => void;
  onFreeze?: () => void;
  onPause?: () => void;
  onPlay?: () => void;
  onPlayerReady?: () => void;
  onStop?: () => void;
  playOnHover?: boolean;
  renderer?: 'svg' | 'canvas' | 'html';
  rendererSettings?: RendererSettings;
  speed?: number;
  src: Record<string, unknown> | string;
  testId?: string;
}

export const DotLottiePlayer: React.FC<DotLottiePlayerProps> = ({
  onError,
  onEnterFrame,
  onComplete,
  onPlayerReady,
  onDataReady,
  onDataFail,
  onStop,
  onPlay,
  onPause,
  onFreeze,
  activeAnimationId,
  autoplay,
  background = 'transparent',
  controls = false,
  direction,
  intermission,
  loop,
  mode,
  playOnHover,
  speed,
  renderer = 'svg',
  rendererSettings = {},
  lottieRef,
  src,
  className,
  testId,
  ...props
}) => {
  const container = useRef(null);
  const [_prevState, setPrevState] = useState(PlayerState.Loading);
  const [isLoop, setIsLoop] = useState(loop);

  const { currentState, dotLottiePlayer, frame, seeker } = useDotLottiePlayer(src, container, {
    lottieRef,
    renderer,
    activeAnimationId,
    rendererSettings: {
      clearCanvas: true,
      progressiveLoad: false,
      hideOnTransparent: true,
      ...rendererSettings,
    },
    hover: playOnHover,
    loop: isLoop,
    direction,
    speed,
    intermission,
    playMode: mode,
    autoplay: playOnHover ? false : autoplay,
    testId,
  });

  const isPlaying = useMemo(() => {
    return currentState === PlayerState.Playing;
  }, [currentState]);

  const isPaused = useMemo(() => {
    return currentState === PlayerState.Paused;
  }, [currentState]);

  const isStopped = useMemo(() => {
    return currentState === PlayerState.Stopped;
  }, [currentState]);

  const isError = useMemo(() => {
    return currentState === PlayerState.Error;
  }, [currentState]);

  // eslint-disable-next-line no-warning-comments
  // TODO: let _io: IntersectionObserver | undefined;

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

  useEffect(() => {
    dotLottiePlayer?.updateSrc(src);
  }, [src]);

  // On player props change
  useEffect(() => {
    if (!dotLottiePlayer) return;
    if (typeof loop !== 'undefined') {
      dotLottiePlayer.setLoop(loop);
    }
    if (typeof autoplay !== 'undefined') {
      dotLottiePlayer.setAutoplay(autoplay);
    }

    if (typeof direction !== 'undefined') {
      dotLottiePlayer.setDirection(direction);
    }
    if (typeof speed !== 'undefined') {
      dotLottiePlayer.setSpeed(speed);
    }
    if (typeof mode !== 'undefined') {
      dotLottiePlayer.setMode(mode);
    }
    if (typeof playOnHover !== 'undefined') {
      dotLottiePlayer.setHover(playOnHover);
    }
  }, [loop, autoplay, speed, direction, mode, playOnHover]);

  useEffect(() => {
    if (!dotLottiePlayer) return;
    if (activeAnimationId) {
      dotLottiePlayer.play(activeAnimationId);
    }
  }, [activeAnimationId]);

  // eslint-disable-next-line no-warning-comments
  // TODO: Do canvas resize on browser resize

  /**
   * Adding event listeners if dotLottiePlayer is available
   */
  useEffect(() => {
    if (!dotLottiePlayer) return undefined;

    dotLottiePlayer.addEventListener('DOMLoaded', () => {
      onPlayerReady?.();
    });

    dotLottiePlayer.addEventListener('data_ready', () => {
      onDataReady?.();
    });

    dotLottiePlayer.addEventListener('data_failed', () => {
      onDataFail?.();
    });

    dotLottiePlayer.addEventListener('complete', () => {
      if (currentState !== PlayerState.Playing) {
        onComplete?.();
      }
    });

    return () => {
      dotLottiePlayer.destroy();
    };
  }, [dotLottiePlayer]);

  useEffect(() => {
    onEnterFrame?.(frame, seeker);
  }, [frame]);

  useEffect(() => {
    switch (currentState) {
      case PlayerState.Stopped:
        onStop?.();
        break;

      case PlayerState.Paused:
        onPause?.();
        break;

      case PlayerState.Playing:
        onPlay?.();
        break;

      case PlayerState.Frozen:
        onFreeze?.();
        break;

      case PlayerState.Error:
        onError?.();
        break;

      default:
        break;
    }
  }, [currentState]);

  function renderControls(): JSX.Element {
    return (
      <div aria-label="lottie-animation-controls" className="toolbar">
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
      </div>
    );
  }

  return (
    <div
      className={`dotlottie-container main ${controls ? 'controls' : ''} ${className}`}
      lang="en"
      role="img"
      {...(testId && {
        'data-testid': testId,
        'data-player-state': currentState,
        'data-player-seeker': seeker || 0,
      })}
      {...props}
    >
      <div
        ref={container}
        data-name="my-anim"
        className={`animation ${controls ? 'controls' : ''}`}
        style={{ background, position: 'relative' }}
        {...(testId && {
          'data-testid': `animation`,
        })}
      >
        {isError && (
          <div
            {...(testId && {
              'data-testid': `error`,
            })}
            className="error"
          >
            ⚠️
          </div>
        )}
      </div>
      {controls && renderControls()}
    </div>
  );
};
