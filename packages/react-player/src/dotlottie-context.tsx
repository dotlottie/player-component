/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottiePlayer } from 'common';
import { createContext, useContext } from 'react';

export const DotLottieContext = createContext<DotLottiePlayer | undefined>(undefined);

export const useDotLottieContext = (): DotLottiePlayer | undefined => {
  const dotLottiePlayer = useContext(DotLottieContext);

  return dotLottiePlayer;
};
