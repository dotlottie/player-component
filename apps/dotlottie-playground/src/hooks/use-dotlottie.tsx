import { DotLottie as DotLottieJs, PlayMode } from '@dotlottie/dotlottie-js';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { createError } from '../utils';
import { PlaybackOptions } from '@dotlottie/react-player';

interface DotLottieContext {
  dotLottie: DotLottieJs;
  setDotLottie: (dotLottie: DotLottieJs) => void;
  setPlaybackOptions: (animationId: string, options: PlaybackOptions) => void;
}

const DotLottieContext = createContext<DotLottieContext>({
  dotLottie: new DotLottieJs(),
  setDotLottie: () => {},
  setPlaybackOptions: () => {},
});

export const DotLottieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dotLottie, setDotLottieState] = useState<DotLottieJs>(new DotLottieJs());

  const setDotLottie = useCallback(
    (dotLottie: DotLottieJs) => {
      setDotLottieState(dotLottie);
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
        animation.playMode = options.playMode as PlayMode;
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

export const useDotLottie = (): DotLottieContext => {
  const dotLottie = useContext(DotLottieContext);

  if (typeof dotLottie === 'undefined') {
    throw createError('useDotLottie must be used within a DotLottieProvider');
  }

  return dotLottie;
};
