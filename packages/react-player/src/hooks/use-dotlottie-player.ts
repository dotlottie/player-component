/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieConfig, DotLottieElement, RendererType } from '@dotlottie/common';
import { DotLottieCommonPlayer } from '@dotlottie/common';
import type { MutableRefObject } from 'react';
import { useLayoutEffect, useRef, useState } from 'react';

export const useDotLottiePlayer = (
  src: Record<string, unknown> | string,
  containerRef: MutableRefObject<DotLottieElement | null>,
  config?: DotLottieConfig<RendererType>,
): DotLottieCommonPlayer => {
  const [dotLottiePlayer] = useState(() => new DotLottieCommonPlayer(src, containerRef.current, config));

  const loadedRef = useRef(false);

  useLayoutEffect(() => {
    async function load(): Promise<void> {
      if (!loadedRef.current && containerRef.current) {
        loadedRef.current = true;

        dotLottiePlayer.setContainer(containerRef.current);

        await dotLottiePlayer.load();
      }
    }

    load();

    return () => {
      if (loadedRef.current) {
        dotLottiePlayer.destroy();
      }
    };
  }, [dotLottiePlayer]);

  return dotLottiePlayer;
};
