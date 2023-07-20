/**
 * Copyright 2023 Design Barn Inc.
 */

import type {
  DotLottieConfig,
  PlaybackOptions,
  Manifest,
  RendererType,
  DotLottiePlayerState,
  PlayMode,
  AnimationDirection,
  AnimationItem,
} from '@dotlottie/common';
import { DotLottiePlayer } from '@dotlottie/common';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useState, useImperativeHandle } from 'react';

import pkg from '../../package.json';

export interface DotLottieRefProps {
  enterInteractiveMode: (stateId: string) => void;
  getContainer: () => HTMLDivElement | undefined;
  getCurrentAnimationId: () => string | undefined;
  getLottie: () => AnimationItem | undefined;
  getManifest: () => Manifest | undefined;
  getState: () => DotLottiePlayerState;
  getVersions: () => Versions;
  goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void;
  goToAndStop(value: number | string, isFrame?: boolean, name?: string): void;
  next: (
    getOptions?: (currPlaybackOptions?: PlaybackOptions, manifestPlaybackOptions?: PlaybackOptions) => PlaybackOptions,
  ) => void;
  pause: () => void;
  play: (
    indexOrId?: string | number,
    getOptions?: (currPlaybackOptions?: PlaybackOptions, manifestPlaybackOptions?: PlaybackOptions) => PlaybackOptions,
  ) => void;
  playOnScroll: (scrollOptions?: {
    positionCallback?: (position: number) => void;
    segments?: [number, number];
    threshold?: [number, number];
  }) => void;
  playOnShow: (playOnShowOptions?: { threshold: number[] }) => void;
  previous: (
    getOptions?: (currPlaybackOptions?: PlaybackOptions, manifestPlaybackOptions?: PlaybackOptions) => PlaybackOptions,
  ) => void;
  reset: () => void;
  resize(): void;
  revertToManifestValues: (playbackKeys?: Array<keyof PlaybackOptions | 'activeAnimationId'>) => void;
  seek: (frame: number) => void;
  setAutoplay: (autoplay: boolean) => void;
  setBackground: (background: string) => void;
  setDefaultTheme: (defaultTheme: string) => void;
  setDirection: (direction: AnimationDirection) => void;
  setHover: (hover: boolean) => void;
  setIntermission: (intermission: number) => void;
  setLoop: (loop: number | boolean) => void;
  setPlayMode: (mode: PlayMode) => void;
  setSpeed: (speed: number) => void;
  stop(): void;
  stopPlayOnScroll: () => void;
  stopPlayOnShow: () => void;
  togglePlay(): void;
}

export interface Versions {
  dotLottieReactVersion: string;
  lottieWebVersion: string;
}

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  container: MutableRefObject<HTMLDivElement | null>,
  config?: DotLottieConfig<RendererType> & {
    lottieRef?: MutableRefObject<DotLottieRefProps | undefined>;
  },
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
        const exposedFunctions: DotLottieRefProps = {
          play: (
            indexOrId?: string | number,
            getOptions?: (
              currPlaybackOptions: PlaybackOptions,
              manifestPlaybackOptions: PlaybackOptions,
            ) => PlaybackOptions,
          ): void => {
            dotLottiePlayer.play(indexOrId, getOptions);
          },
          previous: (
            getOptions?: (
              currPlaybackOptions: PlaybackOptions,
              manifestPlaybackOptions: PlaybackOptions,
            ) => PlaybackOptions,
          ): void => {
            dotLottiePlayer.previous(getOptions);
          },
          next: (
            getOptions?: (
              currPlaybackOptions: PlaybackOptions,
              manifestPlaybackOptions: PlaybackOptions,
            ) => PlaybackOptions,
          ): void => {
            dotLottiePlayer.next(getOptions);
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
          getVersions: (): Versions => {
            return {
              lottieWebVersion: DotLottiePlayer.getLottieWebVersion(),
              dotLottieReactVersion: `${pkg.version}`,
            };
          },
          setDefaultTheme: (defaultTheme: string): void => {
            dotLottiePlayer.setDefaultTheme(defaultTheme);
          },
          setBackground: (background: string): void => {
            dotLottiePlayer.setBackground(background);
          },
          setAutoplay: (autoplay: boolean): void => {
            dotLottiePlayer.setAutoplay(autoplay);
          },
          setDirection: (direction: AnimationDirection): void => {
            dotLottiePlayer.setDirection(direction);
          },
          setHover: (hover: boolean): void => {
            dotLottiePlayer.setHover(hover);
          },
          setIntermission: (intermission: number): void => {
            dotLottiePlayer.setIntermission(intermission);
          },
          setLoop: (loop: number | boolean): void => {
            dotLottiePlayer.setLoop(loop);
          },
          setPlayMode: (mode: PlayMode): void => {
            dotLottiePlayer.setMode(mode);
          },
          setSpeed: (speed: number): void => {
            dotLottiePlayer.setSpeed(speed);
          },
          revertToManifestValues: (playbackKeys?: Array<keyof PlaybackOptions | 'activeAnimationId'>) => {
            dotLottiePlayer.revertToManifestValues(playbackKeys);
          },
          pause: () => {
            dotLottiePlayer.pause();
          },
          seek: (frame: number) => {
            dotLottiePlayer.seek(frame);
          },
          getContainer: (): HTMLDivElement | undefined => {
            return dotLottiePlayer.container;
          },
          goToAndPlay: (value: number | string, isFrame?: boolean, name?: string): void => {
            dotLottiePlayer.goToAndPlay(value, isFrame, name);
          },
          goToAndStop: (value: number | string, isFrame?: boolean, name?: string): void => {
            dotLottiePlayer.goToAndStop(value, isFrame, name);
          },
          stop: (): void => {
            dotLottiePlayer.stop();
          },
          togglePlay: (): void => {
            dotLottiePlayer.togglePlay();
          },
          resize: (): void => {
            dotLottiePlayer.resize();
          },
          enterInteractiveMode: (stateId: string) => {
            dotLottiePlayer.enterInteractiveMode(stateId);
          },
          playOnShow: (playOnShowOptions?: { threshold: number[] }): void => {
            dotLottiePlayer.playOnShow(playOnShowOptions);
          },
          stopPlayOnShow: (): void => {
            dotLottiePlayer.stopPlayOnShow();
          },
          playOnScroll: (scrollOptions?: {
            positionCallback?: (position: number) => void;
            segments?: [number, number];
            threshold?: [number, number];
          }): void => {
            dotLottiePlayer.playOnScroll(scrollOptions);
          },
          stopPlayOnScroll: (): void => {
            dotLottiePlayer.stopPlayOnScroll();
          },
        };

        return exposedFunctions;
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
