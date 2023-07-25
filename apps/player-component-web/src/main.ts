/**
 * Copyright 2023 Design Barn Inc.
 */

import './style.css';
import { loader } from './loader.ts';
import '@dotlottie/player-component';
import { DotLottiePlayer } from '@dotlottie/player-component';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>dotLottie player</h1>
    <div class="card">
      <button id="counter" type="button">Load animation</button>
      <button id="next" type="button">Next</button>
      <button id="prev" type="button">Prev</button>
      <button id="exploding_pigeon" type="button">exploding pigeon</button>
      <button id="smiley_wifi" type="button">Smiley Wifi</button>
      <button id="reset" type="button">Reset</button>
      <dotlottie-player activeStateId="exploding_pigeon" src="/test_02_with_states.lottie" id="dotlottie-player" speed=1 playMode="normal" autoplay loop></dotlottie-player>
      </div>
  </div>
`;

// Switch out for bounce / wifi
// <dotlottie-player src="https://lottie.host/c7029f2f-d015-4d88-93f6-7693bf88692b/d7j8UjWsGt.lottie" id="dotlottie-player" speed=1 playMode="normal" ></dotlottie-player>

// Switch out for pigeon aniamtion
// <dotlottie-player src="https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json" id="dotlottie-player" speed=1 playMode="normal" ></dotlottie-player>


loader(
  document.querySelector<HTMLButtonElement>('#counter')!,
  document.querySelector<DotLottiePlayer>('#dotlottie-player')!,
  document.querySelector<HTMLButtonElement>('#next')!,
  document.querySelector<HTMLButtonElement>('#prev')!,
  document.querySelector<HTMLButtonElement>('#exploding_pigeon')!,
  document.querySelector<HTMLButtonElement>('#smiley_wifi')!,
  document.querySelector<HTMLButtonElement>('#reset')!,
);
