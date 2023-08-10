/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie, type PlayMode, type StateInfo, type DotLottieStates } from '@dotlottie/dotlottie-js';
import { type Animation } from '@lottiefiles/lottie-types';
import React, { type ReactNode, createContext, useCallback, useContext, useState } from 'react';

import { setAnimations } from '../store/animation-slice';
import { type EditorAnimationOptions } from '../store/editor-slice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setPlayerUrl } from '../store/playground-slice';
import { setStates } from '../store/state-slice';
import { setThemes } from '../store/theme-slice';
import { createError } from '../utils';

export interface DotLottieStateMachineOptions {
  descriptor: StateInfo;
  states: DotLottieStates;
}

interface DotLottieContextProps {
  addDotLottieAnimation: (animation: Animation, animationId: string) => void;
  addDotLottieStateMachine: (stateMachine: DotLottieStateMachineOptions, previousStateId?: string) => void;
  addDotLottieTheme: (theme: string, themeId: string) => void;
  buildAndUpdateUrl: () => void | Promise<void>;
  dotLottie: DotLottie;
  downloadDotLottie: () => void | Promise<void>;
  fetchAndUpdateDotLottie: () => void;
  removeDotLottieAnimation: (animationId: string) => void;
  removeDotLottieState: (stateId: string) => void;
  removeDotLottieTheme: (themeId: string) => void;
  setAnimationOptions: (animationId: string, options: EditorAnimationOptions) => void | Promise<void>;
  setDotLottie: (dotLottie: DotLottie) => void | Promise<void>;
}

const DotLottieContext = createContext<DotLottieContextProps>({
  dotLottie: new DotLottie(),
  setDotLottie: () => undefined,
  setAnimationOptions: () => undefined,
  addDotLottieStateMachine: () => undefined,
  fetchAndUpdateDotLottie: () => undefined,
  addDotLottieTheme: () => undefined,
  addDotLottieAnimation: () => undefined,
  downloadDotLottie: () => undefined,
  removeDotLottieAnimation: () => undefined,
  removeDotLottieState: () => undefined,
  removeDotLottieTheme: () => undefined,
  buildAndUpdateUrl: () => undefined,
});

export const DotLottieProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [dotLottie, setDotLottieState] = useState<DotLottie>(new DotLottie());
  const currentPlayerUrl = useAppSelector((state) => state.playground.playerUrl);
  const workingFileName = useAppSelector((state) => state.playground.workingFileName);
  const dispatch = useAppDispatch();

  const setDotLottie = useCallback(
    (_dotLottie: DotLottie) => {
      setDotLottieState(_dotLottie);
    },
    [setDotLottieState],
  );

  const fetchAndUpdateDotLottie = useCallback(() => {
    const _anims = dotLottie.manifest.animations.map((item) => {
      return {
        name: `${item.id}`,
        type: 'json',
      };
    });

    const _states = dotLottie.states.map((item) => {
      return {
        name: `${item.id}`,
        type: 'json',
      };
    });

    const _themes = dotLottie.themes.map((item) => {
      return {
        name: `${item.id}`,
        type: 'lss',
      };
    });

    dispatch(setAnimations(_anims));
    dispatch(setStates(_states));
    dispatch(setThemes(_themes));
  }, [dispatch, dotLottie]);

  const buildAndUpdateUrl = useCallback(async () => {
    const _prev = currentPlayerUrl;

    await dotLottie.build();
    const _file = await dotLottie.toBlob();

    // eslint-disable-next-line  node/no-unsupported-features/node-builtins
    const url = URL.createObjectURL(_file);

    dispatch(setPlayerUrl(''));
    dispatch(setPlayerUrl(url));
    if (_prev) {
      // eslint-disable-next-line  node/no-unsupported-features/node-builtins
      URL.revokeObjectURL(_prev);
    }
  }, [dotLottie]);

  // Add State
  const addDotLottieStateMachine = useCallback(
    (stateMachine: DotLottieStateMachineOptions, previousStateId?: string): void => {
      if (previousStateId) {
        dotLottie.removeState(previousStateId);
      } else {
        dotLottie.removeState(stateMachine.descriptor.id);
      }
      dotLottie.addStateMachine(stateMachine);
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    },
    [dotLottie, fetchAndUpdateDotLottie],
  );

  // Add Theme
  const addDotLottieTheme = useCallback(
    (theme: string, themeId: string) => {
      dotLottie.removeTheme(themeId);
      dotLottie.addTheme({
        id: themeId,
        data: theme,
      });
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    },
    [dotLottie, fetchAndUpdateDotLottie],
  );

  // Add Animation
  const addDotLottieAnimation = useCallback(
    (animation: Animation, animationId: string) => {
      dotLottie.addAnimation({
        id: animationId,
        data: animation,
      });
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    },
    [dotLottie, fetchAndUpdateDotLottie, buildAndUpdateUrl],
  );

  // Remove State
  const removeDotLottieState = useCallback(
    (stateId: string) => {
      dotLottie.removeState(stateId);
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    },
    [dotLottie, fetchAndUpdateDotLottie, buildAndUpdateUrl],
  );

  // Remove Animation
  const removeDotLottieAnimation = useCallback(
    (animationId: string) => {
      dotLottie.removeAnimation(animationId);
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    },
    [dotLottie],
  );

  // Remove Theme
  const removeDotLottieTheme = useCallback(
    (themeId: string) => {
      dotLottie.removeTheme(themeId);
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    },
    [dotLottie],
  );

  // Download .lottie
  const downloadDotLottie = useCallback(async () => {
    await dotLottie.build().then(() => {
      dotLottie.download(workingFileName);
    });
  }, [dotLottie, workingFileName]);

  const setAnimationOptions = useCallback(
    async (animationId: string, options: EditorAnimationOptions) => {
      const animation = await dotLottie.getAnimation(animationId);

      if (animation) {
        animation.loop = Boolean(options.loop);
        animation.speed = Number(options.speed);
        animation.autoplay = Boolean(options.autoplay);
        animation.playMode = options.playMode as unknown as PlayMode;
        animation.direction = Number(options.direction);
        animation.intermission = Number(options.intermission);
        animation.hover = Boolean(options.hover);
        animation.defaultTheme = options.defaultTheme;

        if (options.assignedThemes) {
          const themes = options.assignedThemes.split(',');

          // Unassigned Themes
          animation.themes.forEach((theme) => {
            if (!themes.includes(theme.id)) {
              dotLottie.unassignTheme({ animationId, themeId: theme.id });
            }
          });
          // Assign Themes
          themes.forEach((themeId) => {
            dotLottie.assignTheme({ animationId, themeId });
          });
        }

        animation.defaultActiveAnimation = options.defaultActiveAnimation || false;
        // Remove default from other animations
        if (options.defaultActiveAnimation) {
          dotLottie.animations.forEach((anim) => {
            if (animation.id !== anim.id) {
              anim.defaultActiveAnimation = false;
            }
          });
        }
      }
    },
    [dotLottie],
  );

  return (
    <DotLottieContext.Provider
      value={{
        addDotLottieAnimation,
        addDotLottieStateMachine,
        addDotLottieTheme,
        buildAndUpdateUrl,
        dotLottie,
        downloadDotLottie,
        fetchAndUpdateDotLottie,
        removeDotLottieAnimation,
        removeDotLottieState,
        removeDotLottieTheme,
        setDotLottie,
        setAnimationOptions,
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
