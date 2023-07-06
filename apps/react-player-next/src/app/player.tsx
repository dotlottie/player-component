/**
 * Copyright 2023 Design Barn Inc.
 */

'use client';

import { Controls, DotLottiePlayer } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

export default function Player(): JSX.Element {
  return (
    <div>
      <DotLottiePlayer
        style={{ height: '400px' }}
        loop
        src="https://lottie.host/c7029f2f-d015-4d88-93f6-7693bf88692b/d7j8UjWsGt.lottie"
        autoplay
      >
        <Controls />
      </DotLottiePlayer>
    </div>
  );
}
