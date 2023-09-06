/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererSettings, PlayMode } from '@dotlottie/common';
import { PlayerState, PlayerEvents } from '@dotlottie/common';
import React, { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { useUpdateEffect } from 'react-use';

import type { DotLottieRefProps } from './hooks/use-dotlottie-player';
import { useDotLottiePlayer } from './hooks/use-dotlottie-player';
import { useSelectDotLottieState } from './hooks/use-select-dotlottie-state';
import { DotLottieProvider } from './providers';

export interface DotLottiePlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  activeAnimationId?: string;
  activeStateId?: string;
  autoplay?: boolean;
  background?: string;
  className?: string;
  defaultTheme?: string;
  direction?: 1 | -1;
  hover?: boolean;
  intermission?: number;
  light?: boolean;
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
  className = '',
  testId,
  children,
  defaultTheme,
  light = false,
  activeStateId,
  ...props
}) => {
  const container = useRef(null);

  const { dotLottiePlayer, initDotLottiePlayer } = useDotLottiePlayer(src, container, {
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
    light,
    activeStateId,
  });

  const currentState = useSelectDotLottieState(dotLottiePlayer, (state) => state.currentState);
  const frame = useSelectDotLottieState(dotLottiePlayer, (state) => state.frame);
  const seeker = useSelectDotLottieState(dotLottiePlayer, (state) => state.seeker);
  const currentAnimationId = useSelectDotLottieState(dotLottiePlayer, (state) => state.currentAnimationId);

  /**
   * Updating prop changes.
   */
  useUpdateEffect(() => {
    if (typeof loop === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['loop']);
    } else {
      dotLottiePlayer.setLoop(loop);
    }
  }, [loop]);

  useUpdateEffect(() => {
    if (typeof autoplay === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['autoplay']);
    } else {
      dotLottiePlayer.setAutoplay(autoplay);
    }
  }, [autoplay]);

  useUpdateEffect(() => {
    if (typeof direction === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['direction']);
    } else {
      dotLottiePlayer.setDirection(direction);
    }
  }, [direction]);

  useUpdateEffect(() => {
    if (typeof speed === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['speed']);
    } else {
      dotLottiePlayer.setSpeed(speed);
    }
  }, [speed]);

  useUpdateEffect(() => {
    if (typeof playMode === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['playMode']);
    } else {
      dotLottiePlayer.setMode(playMode);
    }
  }, [playMode]);

  useUpdateEffect(() => {
    if (typeof hover === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['hover']);
    } else {
      dotLottiePlayer.setHover(hover);
    }
  }, [hover]);

  useUpdateEffect(() => {
    if (typeof background === 'undefined') {
      dotLottiePlayer.setBackground('transparent');
    } else {
      dotLottiePlayer.setBackground(background);
    }
  }, [background]);

  useUpdateEffect(() => {
    if (typeof intermission === 'undefined') {
      dotLottiePlayer.revertToManifestValues(['intermission']);
    } else {
      dotLottiePlayer.setIntermission(intermission);
    }
  }, [intermission]);

  useUpdateEffect(() => {
    if (typeof defaultTheme === 'undefined' || !defaultTheme) {
      dotLottiePlayer.revertToManifestValues(['defaultTheme']);
    } else {
      dotLottiePlayer.setDefaultTheme(defaultTheme);
    }
  }, [defaultTheme]);

  useUpdateEffect(() => {
    if (activeAnimationId) {
      dotLottiePlayer.play(activeAnimationId);
    }
  }, [activeAnimationId]);

  useUpdateEffect(() => {
    if (typeof activeStateId !== 'undefined') {
      dotLottiePlayer.enterInteractiveMode(activeStateId);
    }

    return () => {
      dotLottiePlayer.exitInteractiveMode();
    };
  }, [activeStateId]);

  useUpdateEffect(() => {
    if (typeof src !== 'undefined') {
      initDotLottiePlayer();
    }
  }, [src]);

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
        {...(testId && {
          'data-testid': testId,
        })}
        {...props}
      >
        <div
          ref={container}
          data-name={`${currentAnimationId}`}
          role="figure"
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
