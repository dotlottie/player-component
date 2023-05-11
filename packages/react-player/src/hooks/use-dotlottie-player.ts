/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieConfig, PlaybackOptions } from 'common';
import { DotLottiePlayer, PlayerState } from 'common';
import type { RendererType } from 'lottie-web';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useState } from 'react';

interface UseDotLottiePlayerReturn {
  currentState: PlayerState;
  dotLottiePlayer?: DotLottiePlayer;
  frame: number;
  seeker: number;
}

export interface DotLottieRefProps {
  next: (options?: PlaybackOptions) => void;
  play: (indexOrId?: string | number, options?: PlaybackOptions) => void;
  prev: (options?: PlaybackOptions) => void;
  reset: () => void;
}

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  container?: MutableRefObject<HTMLDivElement | null>,
  config?: DotLottieConfig<RendererType> & { lottieRef: MutableRefObject<DotLottieRefProps> },
): UseDotLottiePlayerReturn => {
  const [dotLottiePlayer, setDotLottiePlayer] = useState<DotLottiePlayer | undefined>();
  const [frame, setFrame] = useState(0);
  const [seeker, setSeeker] = useState(0);
  const [currentState, setCurrentState] = useState(PlayerState.Initial);

  const getDotLottiePlayer = useCallback(async () => {
    if (!container?.current) return undefined;
    const dl = new DotLottiePlayer(src, container.current, config);

    dl.load();

    return dl;
  }, [container]);

  if (config?.lottieRef) {
    useEffect(() => {
      config.lottieRef.current = {
        play: (indexOrId?: string | number, options?: PlaybackOptions): void => {
          dotLottiePlayer?.play(indexOrId, options);
        },
        prev: (options?: PlaybackOptions): void => {
          dotLottiePlayer?.prev(options);
        },
        next: (options?: PlaybackOptions): void => {
          dotLottiePlayer?.next(options);
        },
        reset: (): void => {
          dotLottiePlayer?.reset();
        },
      } as DotLottieRefProps;
    }, [config.lottieRef.current]);
  }

  useEffect(() => {
    if (!dotLottiePlayer) return undefined;
    const disposeFrame = dotLottiePlayer.frame.subscribe((value) => {
      setFrame(value);
    });
    const disposeSeeker = dotLottiePlayer.seeker.subscribe((value) => {
      setSeeker(value);
    });
    const disposePlayerState = dotLottiePlayer.state.subscribe((value) => {
      setCurrentState(value);
    });

    return () => {
      disposeFrame();
      disposePlayerState();
      disposeSeeker();
    };
  }, [dotLottiePlayer]);

  useEffect(() => {
    (async (): Promise<void> => {
      setDotLottiePlayer(await getDotLottiePlayer());
    })();

    return () => {
      dotLottiePlayer?.destroy();
    };
  }, [getDotLottiePlayer]);

  return {
    dotLottiePlayer,
    frame,
    seeker,
    currentState,
  };
};
