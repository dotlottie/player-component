import { DotLottieConfig, DotLottiePlayer, PlayerState } from 'common';
import { RendererType } from 'lottie-web';
import { MutableRefObject, useCallback, useEffect, useState } from 'react';

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  container?: MutableRefObject<HTMLDivElement | null>,
  config?: DotLottieConfig<RendererType>,
) => {
  const [dotLottiePlayer, setDotLottiePlayer] = useState<DotLottiePlayer | undefined>();
  const [frame, setFrame] = useState(0);
  const [seeker, setSeeker] = useState(0);
  const [currentState, setCurrentState] = useState(PlayerState.Initial);

  const getDotLottiePlayer = useCallback(async () => {
    if (!container?.current) return;
    const l = new DotLottiePlayer(src, container.current, config);
    l.load();

    return l;
  }, [container]);

  useEffect(() => {
    if (!dotLottiePlayer) return;
    const disposeFrame = dotLottiePlayer.frame.subscribe((val) => {
      setFrame(val);
    });
    const disposeSeeker = dotLottiePlayer.seeker.subscribe((seeker) => {
      setSeeker(seeker);
    });
    const disposePlayerState = dotLottiePlayer.state.subscribe((val) => {
      setCurrentState(val);
    });

    return () => {
      disposeFrame?.();
      disposePlayerState?.();
      disposeSeeker?.();
    };
  }, [dotLottiePlayer]);

  useEffect(() => {
    if (!getDotLottiePlayer) return;
    (async () => {
      const _lottie = await getDotLottiePlayer();
      setDotLottiePlayer(_lottie);
    })();

    return () => {
      dotLottiePlayer?.destory();
    };
  }, [getDotLottiePlayer]);

  return {
    dotLottiePlayer,
    frame,
    seeker,
    currentState,
  };
};
