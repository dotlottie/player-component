/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottiePlayer } from '@dotlottie/common';
import { createContext, useContext } from 'react';

export const DotLottieContext = createContext<DotLottiePlayer>(new DotLottiePlayer(''));

export const useDotLottieContext = (): DotLottiePlayer => {
  const dotLottiePlayer = useContext(DotLottieContext);

  return dotLottiePlayer;
};
