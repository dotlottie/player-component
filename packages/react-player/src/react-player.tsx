/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererSettings, PlayMode } from '@dotlottie/common';
import { PlayerState, PlayerEvents } from '@dotlottie/common';
import React, { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

import type { DotLottieRefProps } from './hooks/use-dotlottie-player';
import { useDotLottiePlayer } from './hooks/use-dotlottie-player';
import { useSelectDotLottieState } from './hooks/use-select-dotlottie-state';
import { DotLottieProvider } from './providers';

export interface DotLottiePlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  activeAnimationId?: string;
  autoplay?: boolean;
  background?: string;
  className?: string;
  defaultTheme?: string;
  direction?: 1 | -1;
  hover?: boolean;
  intermission?: number;
  loop?: number | boolean;
  lottieRef?: MutableRefObject<DotLottieRefProps | undefined>;
  onEvent?: <T extends PlayerEvents>(name: T, params?: unknown) => void;
  playMode?: PlayMode;
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
  playMode,
  hover,
  speed,
  renderer = 'svg',
  rendererSettings = {},
  lottieRef,
  src,
  className,
  testId,
  children,
  defaultTheme,
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
    hover,
    loop,
    direction,
    speed,
    intermission,
    background,
    playMode,
    autoplay: hover ? false : autoplay,
    testId,
    defaultTheme,
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

    if (typeof playMode !== 'undefined') {
      dotLottiePlayer.setMode(playMode);
    }

    if (typeof hover !== 'undefined') {
      dotLottiePlayer.setHover(hover);
    }

    if (typeof background !== 'undefined') {
      dotLottiePlayer.setBackground(background);
    }

    if (typeof intermission !== 'undefined') {
      dotLottiePlayer.setIntermission(intermission);
    }

    if (typeof defaultTheme !== 'undefined') {
      dotLottiePlayer.setDefaultTheme(defaultTheme);
    }
  }, [loop, autoplay, speed, direction, playMode, hover, background, intermission, defaultTheme]);

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
    <DotLottieProvider value={dotLottiePlayer}>
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
    </DotLottieProvider>
  );
};
