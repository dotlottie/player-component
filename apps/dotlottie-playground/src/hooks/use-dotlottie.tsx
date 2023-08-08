/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie, type PlayMode } from '@dotlottie/dotlottie-js';
import { type PlaybackOptions } from '@dotlottie/react-player';
import React, { type ReactNode, createContext, useCallback, useContext, useState } from 'react';

import { createError } from '../utils';

interface DotLottieContextProps {
  dotLottie: DotLottie;
  setDotLottie: (dotLottie: DotLottie) => void | Promise<void>;
  setPlaybackOptions: (animationId: string, options: PlaybackOptions) => void | Promise<void>;
}

const DotLottieContext = createContext<DotLottieContextProps>({
  dotLottie: new DotLottie(),
  setDotLottie: () => undefined,
  setPlaybackOptions: () => undefined,
});

export const DotLottieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dotLottie, setDotLottieState] = useState<DotLottie>(new DotLottie());

  const setDotLottie = useCallback(
    (_dotLottie: DotLottie) => {
      setDotLottieState(_dotLottie);
    },
    [setDotLottieState],
  );

  const setPlaybackOptions = useCallback(
    async (animationId: string, options: PlaybackOptions) => {
      const animation = await dotLottie.getAnimation(animationId);

      if (animation) {
        animation.defaultTheme = options.defaultTheme;
        animation.loop = Boolean(options.loop);
        animation.speed = Number(options.speed);
        animation.autoplay = Boolean(options.autoplay);
        animation.playMode = options.playMode as unknown as PlayMode;
        animation.direction = Number(options.direction);
        animation.intermission = Number(options.intermission);
        animation.hover = Boolean(options.hover);
        animation.defaultTheme = options.defaultTheme;
      }
    },
    [dotLottie],
  );

  return (
    <DotLottieContext.Provider
      value={{
        dotLottie,
        setDotLottie,
        setPlaybackOptions,
      }}
    >
      {children}
    </DotLottieContext.Provider>
  );
};

export const useDotLottie = (): DotLottieContextProps => {
  const dotLottie = useContext(DotLottieContext);

  if (typeof dotLottie === 'undefined') {
    throw createError('useDotLottie must be used within a DotLottieProvider');
  }

  return dotLottie;
};
