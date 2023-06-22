/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottiePlayer, createError } from '@dotlottie/common';
import { createContext, useContext } from 'react';

const DotLottieContext = createContext<DotLottiePlayer>(new DotLottiePlayer(''));

export const DotLottieProvider = DotLottieContext.Provider;

export const useDotLottieContext = (): DotLottiePlayer => {
  const dotLottiePlayer = useContext(DotLottieContext);

  if (typeof dotLottiePlayer === 'undefined') {
    throw createError('useDotLottieContext must be used within a DotLottieProvider');
  }

  return dotLottiePlayer;
};
