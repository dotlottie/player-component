/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieConfig, PlaybackOptions, Manifest, RendererType } from 'common';
import { DotLottiePlayer } from 'common';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

export interface DotLottieRefProps {
  getManifest: () => Manifest | undefined;
  next: (options?: PlaybackOptions) => void;
  play: (indexOrId?: string | number, options?: PlaybackOptions) => void;
  previous: (options?: PlaybackOptions) => void;
  reset: () => void;
}

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  container?: MutableRefObject<HTMLDivElement | null>,
  config?: DotLottieConfig<RendererType> & { lottieRef?: MutableRefObject<DotLottieRefProps | undefined> },
): DotLottiePlayer | undefined => {
  const [dotLottiePlayer, setDotLottiePlayer] = useState<DotLottiePlayer | undefined>();

  const getDotLottiePlayer = useCallback(async () => {
    if (!container?.current) return undefined;
    const dl = new DotLottiePlayer(src, container.current, config);

    dl.load();

    return dl;
  }, [container]);

  if (config?.lottieRef) {
    useEffect(() => {
      if (!config.lottieRef) return;
      config.lottieRef.current = {
        play: (indexOrId?: string | number, options?: PlaybackOptions): void => {
          dotLottiePlayer?.play(indexOrId, options);
        },
        previous: (options?: PlaybackOptions): void => {
          dotLottiePlayer?.previous(options);
        },
        next: (options?: PlaybackOptions): void => {
          dotLottiePlayer?.next(options);
        },
        reset: (): void => {
          dotLottiePlayer?.reset();
        },
        getManifest: (): Manifest | undefined => {
          return dotLottiePlayer?.getManifest();
        },
      } as DotLottieRefProps;
    }, [config.lottieRef.current]);
  }

  useEffect(() => {
    (async (): Promise<void> => {
      setDotLottiePlayer(await getDotLottiePlayer());
    })();

    return () => {
      dotLottiePlayer?.destroy();
    };
  }, [getDotLottiePlayer]);

  return dotLottiePlayer;
};
