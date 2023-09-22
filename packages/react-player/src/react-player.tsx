/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState, PlayerEvents } from '@dotlottie/common';
import type { RendererSettings, PlayMode, DotLottieCommonPlayer, DotLottieElement } from '@dotlottie/common';
import React, { useEffect, useRef } from 'react';
import { useUpdateEffect } from 'react-use';

import { useDotLottiePlayer } from './hooks/use-dotlottie-player';
import { useSelectDotLottieState } from './hooks/use-select-dotlottie-state';
import { DotLottieProvider } from './providers';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
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
  onEvent?: <T extends PlayerEvents>(name: T, params?: unknown) => void;
  playMode?: PlayMode;
  renderer?: 'svg' | 'canvas' | 'html';
  rendererSettings?: RendererSettings;
  speed?: number;
  src: Record<string, unknown> | string;
  testId?: string;
  worker?: boolean;
}

export const DotLottiePlayer = React.forwardRef<DotLottieCommonPlayer | null, Props>(
  (
    {
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
      src,
      className = '',
      testId,
      children,
      defaultTheme,
      light = false,
      worker = false,
      activeStateId,
      ...props
    },
    ref,
  ) => {
    const containerRef = useRef<DotLottieElement | null>(null);

    const dotLottieCommonPlayer = useDotLottiePlayer(src, containerRef, {
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
      worker,
      activeStateId,
    });

    const dotLottieCommonPlayerRef = useRef<DotLottieCommonPlayer>(dotLottieCommonPlayer);

    dotLottieCommonPlayerRef.current = dotLottieCommonPlayer;

    React.useImperativeHandle<DotLottieCommonPlayer, DotLottieCommonPlayer>(
      ref,
      () => {
        return dotLottieCommonPlayer;
      },
      [dotLottieCommonPlayer],
    );

    const currentState = useSelectDotLottieState(dotLottieCommonPlayer, (state) => state.currentState);
    const frame = useSelectDotLottieState(dotLottieCommonPlayer, (state) => state.frame);
    const seeker = useSelectDotLottieState(dotLottieCommonPlayer, (state) => state.seeker);
    const currentAnimationId = useSelectDotLottieState(dotLottieCommonPlayer, (state) => state.currentAnimationId);

    /**
     * Updating prop changes.
     */
    useUpdateEffect(() => {
      if (typeof loop === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['loop']);
      } else {
        dotLottieCommonPlayerRef.current.setLoop(loop);
      }
    }, [loop]);

    useUpdateEffect(() => {
      if (typeof autoplay === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['autoplay']);
      } else {
        dotLottieCommonPlayerRef.current.setAutoplay(autoplay);
      }
    }, [autoplay]);

    useUpdateEffect(() => {
      if (typeof direction === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['direction']);
      } else {
        dotLottieCommonPlayerRef.current.setDirection(direction);
      }
    }, [direction]);

    useUpdateEffect(() => {
      if (typeof speed === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['speed']);
      } else {
        dotLottieCommonPlayerRef.current.setSpeed(speed);
      }
    }, [speed]);

    useUpdateEffect(() => {
      if (typeof playMode === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['playMode']);
      } else {
        dotLottieCommonPlayerRef.current.setMode(playMode);
      }
    }, [playMode]);

    useUpdateEffect(() => {
      if (typeof hover === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['hover']);
      } else {
        dotLottieCommonPlayerRef.current.setHover(hover);
      }
    }, [hover]);

    useUpdateEffect(() => {
      if (typeof background === 'undefined') {
        dotLottieCommonPlayerRef.current.setBackground('transparent');
      } else {
        dotLottieCommonPlayerRef.current.setBackground(background);
      }
    }, [background]);

    useUpdateEffect(() => {
      if (typeof intermission === 'undefined') {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['intermission']);
      } else {
        dotLottieCommonPlayerRef.current.setIntermission(intermission);
      }
    }, [intermission]);

    useUpdateEffect(() => {
      if (typeof defaultTheme === 'undefined' || !defaultTheme) {
        dotLottieCommonPlayerRef.current.revertToManifestValues(['defaultTheme']);
      } else {
        dotLottieCommonPlayerRef.current.setDefaultTheme(defaultTheme);
      }
    }, [defaultTheme]);

    useUpdateEffect(() => {
      if (activeAnimationId) {
        dotLottieCommonPlayerRef.current.play(activeAnimationId);
      }
    }, [activeAnimationId]);

    useUpdateEffect(() => {
      if (typeof activeStateId !== 'undefined') {
        dotLottieCommonPlayerRef.current.enterInteractiveMode(activeStateId);
      }

      return (): void => {
        dotLottieCommonPlayerRef.current.exitInteractiveMode();
      };
    }, [activeStateId]);

    useUpdateEffect(() => {
      if (typeof src !== 'undefined') {
        dotLottieCommonPlayerRef.current.updateSrc(src);
      }
    }, [src]);

    /**
     * Adding event listeners if dotLottieCommonPlayerRef.current? is available
     */
    useEffect(() => {
      const onDOMLoaded = (): void => {
        onEvent?.(PlayerEvents.Ready);
      };
      const onDataReady = (): void => {
        onEvent?.(PlayerEvents.DataReady);
      };
      const onDataFailed = (): void => {
        onEvent?.(PlayerEvents.DataFail);
      };
      const onComplete = (): void => {
        if (dotLottieCommonPlayerRef.current.currentState !== PlayerState.Playing) {
          onEvent?.(PlayerEvents.Complete);
        }
      };
      const onLoopComplete = (): void => {
        onEvent?.(PlayerEvents.LoopComplete);
      };

      dotLottieCommonPlayerRef.current.addEventListener('DOMLoaded', onDOMLoaded);
      dotLottieCommonPlayerRef.current.addEventListener('data_ready', onDataReady);
      dotLottieCommonPlayerRef.current.addEventListener('data_failed', onDataFailed);
      dotLottieCommonPlayerRef.current.addEventListener('complete', onComplete);
      dotLottieCommonPlayerRef.current.addEventListener('loopComplete', onLoopComplete);
    }, []);

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
      <DotLottieProvider value={dotLottieCommonPlayer}>
        <div
          className={`dotlottie-container main ${children ? 'controls' : ''} ${className}`}
          lang="en"
          {...(testId && {
            'data-testid': testId,
          })}
          {...props}
        >
          <div
            ref={containerRef}
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
  },
);
