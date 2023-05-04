import * as React from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PlayerState, PlayMode, RendererSettings } from 'common';
import { useDotLottiePlayer } from './hooks/useDotLottiePlayer';

export interface DotLottiePlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  onComplete?: () => void;
  onDataFail?: () => void;
  onDataReady?: () => void;
  onError?: () => void;
  onEnterFrame?: (currentFrame: number, seeker: number) => void;
  onPlayerReady?: () => void;
  onStop?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onFreeze?: () => void;
  autoplay?: boolean;
  background?: string;
  controls?: boolean;
  count?: number;
  direction?: 1 | -1;
  renderer?: 'svg' | 'canvas' | 'html';
  rendererSettings?: RendererSettings;
  loop?: boolean;
  mode?: PlayMode;
  playOnHover?: boolean;
  speed?: number;
  src: Record<string, unknown> | string;
  className?: string;
  testId?: string;
}

export const DotLottiePlayer = ({
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
  autoplay = false,
  background = 'transparent',
  controls = false,
  direction = 1,
  loop = false,
  mode = PlayMode.Normal,
  playOnHover = false,
  speed = 1,
  renderer = 'svg',
  rendererSettings = {},
  src,
  className,
  testId,
  ...props
}: DotLottiePlayerProps) => {
  const container = useRef(null);
  const [_prevState, setPrevState] = useState(PlayerState.Loading);
  const [hover, setHover] = useState(false);
  const [isLoop, setIsLoop] = useState(loop);

  const { dotLottiePlayer, frame, seeker, currentState } = useDotLottiePlayer(src, container, {
    renderer: renderer,
    rendererSettings: {
      clearCanvas: true,
      progressiveLoad: false,
      hideOnTransparent: true,
      ...(rendererSettings || {}),
    },
    loop: isLoop,
    mode: mode,
    autoplay: playOnHover ? false : autoplay,
    testId: testId,
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

  //TODO: let _io: IntersectionObserver | undefined;

  function handleSeekChange(event: React.FormEvent<HTMLInputElement>) {
    if (!dotLottiePlayer || isNaN(Number(event.currentTarget.value))) {
      return;
    }
    const frame: number = (Number(event.currentTarget.value) / 100) * dotLottiePlayer.totalFrames;

    seek(frame, currentState);
  }

  function togglePlay(): void {
    if (!dotLottiePlayer) return;
    return currentState === PlayerState.Playing
      ? dotLottiePlayer?.pause()
      : dotLottiePlayer?.play();
  }

  function seek(value: number | string, nextState: PlayerState): void {
    if (!dotLottiePlayer) return;

    if (typeof value === 'number') value = Math.round(value);

    // Extract frame number from either number or percentage value
    const matches = value.toString().match(/^([0-9]+)(%?)$/);

    if (!matches) {
      return;
    }

    // Calculate and set the frame number
    const frame =
      matches[2] === '%' ? (dotLottiePlayer.totalFrames * Number(matches[1])) / 100 : matches[1];

    // Set seeker to new frame number

    if (frame === undefined) return;

    // Send lottie player to the new frame
    if (nextState === PlayerState.Playing) {
      dotLottiePlayer?.goToAndPlay(frame, true);
    } else {
      dotLottiePlayer?.goToAndStop(frame, true);
      dotLottiePlayer?.pause();
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
    dotLottiePlayer.setLoop(loop);
    dotLottiePlayer.setAutoplay(autoplay);
    dotLottiePlayer.setDirection(direction);
    dotLottiePlayer.setSpeed(speed);
    dotLottiePlayer.setMode(mode);
  }, [loop, autoplay, speed, direction, mode]);

  // TODO: Do canvas resize on browser resize

  // On playOnHover change
  useEffect(() => {
    if (!playOnHover) {
      if (autoplay) dotLottiePlayer?.play();
      return;
    }

    if (hover && currentState !== PlayerState.Playing) {
      dotLottiePlayer?.play();
    } else {
      dotLottiePlayer?.pause();
    }
  }, [playOnHover, hover]);

  /***
   * Adding event listeners if dotLottiePlayer is available
   */
  useEffect(() => {
    if (!dotLottiePlayer) return;

    dotLottiePlayer.setSpeed(speed);
    dotLottiePlayer.setDirection(direction);

    dotLottiePlayer.addEventListener('DOMLoaded', () => {
      dotLottiePlayer.setDirection(direction);
      dotLottiePlayer.setSpeed(speed);
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
        return;
      }
    });

    return () => {};
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
          onClick={() => dotLottiePlayer?.stop()}
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
          onInput={(event) => handleSeekChange(event)}
          onMouseDown={() => {
            setPrevState(currentState);
            dotLottiePlayer?.freeze();
          }}
          onMouseUp={() => {
            seek(frame || 0, _prevState);
          }}
          aria-valuemin={1}
          aria-valuemax={100}
          role="slider"
          aria-valuenow={seeker}
          aria-label="lottie-seek-input"
        />
        <button
          onClick={() => {
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
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        ref={container}
        data-name="my-anim"
        className={`animation ${controls ? 'controls' : ''}`}
        style={{ background: background, position: 'relative' }}
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
