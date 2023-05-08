/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieConfig } from 'common';
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

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  container?: MutableRefObject<HTMLDivElement | null>,
  config?: DotLottieConfig<RendererType>,
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
