/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererSettings, PlayMode } from 'common';
import { PlayerState } from 'common';
import React, { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

import { DotLottieContext } from './dotlottie-context';
import type { DotLottieRefProps } from './hooks/use-dotlottie-player';
import { useDotLottiePlayer } from './hooks/use-dotlottie-player';
import { useSelectDotLottieState } from './hooks/use-select-dotlottie-state';

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

export const DotLottiePlayer: React.FC<DotLottiePlayerProps> = ({
  onEvent,
  activeAnimationId,
  autoplay,
  background = 'transparent',
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

  const dotLottiePlayer = useDotLottiePlayer(src, container, {
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
    background,
    playMode: mode,
    autoplay: playOnHover ? false : autoplay,
    testId,
  });

  const currentState = useSelectDotLottieState(dotLottiePlayer, (state) => state.currentState);
  const frame = useSelectDotLottieState(dotLottiePlayer, (state) => state.frame);
  const seeker = useSelectDotLottieState(dotLottiePlayer, (state) => state.seeker);

  // On player props change
  useEffect(() => {
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

    if (typeof background !== 'undefined') {
      dotLottiePlayer.setBackground(background);
    }
  }, [loop, autoplay, speed, direction, mode, playOnHover, background]);

  useEffect(() => {
    if (activeAnimationId) {
      dotLottiePlayer.play(activeAnimationId);
    }
  }, [activeAnimationId]);

  /**
   * Adding event listeners if dotLottiePlayer is available
   */
  useEffect(() => {
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
      if (dotLottiePlayer.currentState !== PlayerState.Playing) {
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

  useEffect(() => {
    onEvent?.(PlayerEvents.Frame, { frame, seeker });
  }, [frame]);

  return (
    <DotLottieContext.Provider value={dotLottiePlayer}>
      <div
        className={`dotlottie-container main ${children ? 'controls' : ''} ${className}`}
        lang="en"
        role="img"
        {...(testId && {
          'data-testid': testId,
        })}
        {...props}
      >
        <div
          ref={container}
          data-name="my-anim"
          className={`animation ${children ? 'controls' : ''}`}
          style={{ position: 'relative' }}
          {...(testId && {
            'data-testid': `animation`,
          })}
        >
          {currentState === PlayerState.Error && (
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
