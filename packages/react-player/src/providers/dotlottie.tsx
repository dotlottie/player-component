/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieCommonPlayer } from '@dotlottie/common';
import { createError } from '@dotlottie/common';
import { createContext, useContext } from 'react';

const DotLottieContext = createContext<DotLottieCommonPlayer | null>(null);

export const DotLottieProvider = DotLottieContext.Provider;

export const useDotLottieContext = (): DotLottieCommonPlayer | null => {
  const dotLottiePlayer = useContext(DotLottieContext);

  if (typeof dotLottiePlayer === 'undefined') {
    throw createError('useDotLottieContext must be used within a DotLottieProvider');
  }

  return dotLottiePlayer;
};
