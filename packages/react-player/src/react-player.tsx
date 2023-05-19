/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererSettings, PlayMode } from 'common';
import { PlayerState } from 'common';
import React, { createContext, useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';

import { useDotLottiePlayer } from './hooks/use-dotlottie-player';
import type { DotLottieRefProps, UseDotLottiePlayerReturn } from './hooks/use-dotlottie-player';

export enum PlayerEvents {
  Complete = 'complete',
  DataFail = 'data_fail',
  DataReady = 'data_ready',
  Error = 'error',
  Frame = 'frame',
  Freeze = 'freeze',
  LoopComplete = 'loopComplete',
  Pause = 'pause',
  Play = 'play',
  Ready = 'ready',
  Stop = 'stop',
}

export interface DotLottiePlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  activeAnimationId?: string;
  autoplay?: boolean;
  background?: string;
  className?: string;
  controls?: boolean;
  direction?: 1 | -1;
  intermission?: number;
  loop?: number | boolean;
  lottieRef?: MutableRefObject<DotLottieRefProps | undefined>;
  mode?: PlayMode;
  onEvent?: <T extends PlayerEvents>(name: T, params?: unknown) => void;
  playOnHover?: boolean;
  renderer?: 'svg' | 'canvas' | 'html';
  rendererSettings?: RendererSettings;
  speed?: number;
  src: Record<string, unknown> | string;
  testId?: string;
}

export interface DotLottieContextProps extends UseDotLottiePlayerReturn {
  loop: boolean;
}

export const DotLottieContext = createContext<DotLottieContextProps>({
  currentState: PlayerState.Initial,
  seeker: 0,
  frame: 0,
  loop: false,
});

export const DotLottiePlayer: React.FC<DotLottiePlayerProps> = ({
  onEvent,
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
  children,
  ...props
}) => {
  const container = useRef(null);

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
    loop,
    direction,
    speed,
    intermission,
    playMode: mode,
    autoplay: playOnHover ? false : autoplay,
    testId,
  });

  const isError = useMemo(() => {
    return currentState === PlayerState.Error;
  }, [currentState]);

  // eslint-disable-next-line no-warning-comments
  // TODO: let _io: IntersectionObserver | undefined;

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
      onEvent?.(PlayerEvents.Ready);
    });

    dotLottiePlayer.addEventListener('data_ready', () => {
      onEvent?.(PlayerEvents.DataReady);
    });

    dotLottiePlayer.addEventListener('data_failed', () => {
      onEvent?.(PlayerEvents.DataFail);
    });

    dotLottiePlayer.addEventListener('complete', () => {
      if (currentState !== PlayerState.Playing) {
        onEvent?.(PlayerEvents.Complete);
      }
    });

    dotLottiePlayer.addEventListener('loopComplete', () => {
      onEvent?.(PlayerEvents.LoopComplete);
    });

    return () => {
      dotLottiePlayer.destroy();
    };
  }, [dotLottiePlayer]);

  useEffect(() => {
    onEvent?.(PlayerEvents.LoopComplete, { frame, seeker });
  }, [frame]);

  useEffect(() => {
    switch (currentState) {
      case PlayerState.Stopped:
        onEvent?.(PlayerEvents.Stop);
        break;

      case PlayerState.Paused:
        onEvent?.(PlayerEvents.Pause);
        break;

      case PlayerState.Playing:
        onEvent?.(PlayerEvents.Play);
        break;

      case PlayerState.Frozen:
        onEvent?.(PlayerEvents.Freeze);
        break;

      case PlayerState.Error:
        onEvent?.(PlayerEvents.Error);
        break;

      default:
        break;
    }
  }, [currentState]);

  return (
    <DotLottieContext.Provider
      value={{
        currentState,
        dotLottiePlayer,
        frame,
        seeker,
        loop: Boolean(loop),
      }}
    >
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
        {children}
      </div>
    </DotLottieContext.Provider>
  );
};
