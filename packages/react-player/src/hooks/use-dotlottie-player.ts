/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieConfig, PlaybackOptions, Manifest, RendererType, DotLottiePlayerState } from '@dotlottie/common';
import { DotLottiePlayer } from '@dotlottie/common';
import type { AnimationItem } from 'lottie-web';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useState, useImperativeHandle } from 'react';

export interface DotLottieRefProps {
  getCurrentAnimationId: () => string | undefined;
  getLottie: () => AnimationItem | undefined;
  getManifest: () => Manifest | undefined;
  getState: () => DotLottiePlayerState;
  next: (options?: PlaybackOptions) => void;
  play: (indexOrId?: string | number, options?: PlaybackOptions) => void;
  previous: (options?: PlaybackOptions) => void;
  reset: () => void;
}

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  container: MutableRefObject<HTMLDivElement | null>,
  config?: DotLottieConfig<RendererType> & { lottieRef?: MutableRefObject<DotLottieRefProps | undefined> },
): DotLottiePlayer => {
  const [dotLottiePlayer, setDotLottiePlayer] = useState<DotLottiePlayer>(() => {
    return new DotLottiePlayer(src, container.current, config);
  });

  const getDotLottiePlayer = useCallback(async () => {
    const dl = new DotLottiePlayer(src, container.current, config);

    dl.load();

    return dl;
  }, [container]);

  if (config?.lottieRef) {
    useImperativeHandle(
      config.lottieRef,
      () => {
        return {
          play: (indexOrId?: string | number, options?: PlaybackOptions): void => {
            dotLottiePlayer.play(indexOrId, options);
          },
          previous: (options?: PlaybackOptions): void => {
            dotLottiePlayer.previous(options);
          },
          next: (options?: PlaybackOptions): void => {
            dotLottiePlayer.next(options);
          },
          reset: (): void => {
            dotLottiePlayer.reset();
          },
          getManifest: (): Manifest | undefined => {
            return dotLottiePlayer.getManifest();
          },
          getState: (): DotLottiePlayerState => {
            return dotLottiePlayer.getState();
          },
          getCurrentAnimationId: (): string | undefined => {
            return dotLottiePlayer.currentAnimationId;
          },
          getLottie: (): AnimationItem | undefined => {
            return dotLottiePlayer.getAnimationInstance();
          },
        } as DotLottieRefProps;
      },
      [config.lottieRef.current, dotLottiePlayer],
    );
  }

  useEffect(() => {
    (async (): Promise<void> => {
      setDotLottiePlayer(await getDotLottiePlayer());
    })();

    return () => {
      dotLottiePlayer.destroy();
    };
  }, [getDotLottiePlayer]);

  return dotLottiePlayer;
};
