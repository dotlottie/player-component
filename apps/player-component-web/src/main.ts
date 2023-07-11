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
    </div>
    <dotlottie-player  id="dotlottie-player" speed=1 playMode="normal" direction=1 loop autoplay controls></dotlottie-player>
    <dotlottie-player src="https://lottie.host/f5ea648a-8565-4a00-a6cf-2c3160fe12b8/nRNCht8u2u.lottie" speed=1 playMode="normal" direction=1 loop autoplay controls></dotlottie-player>
  </div>
`;

loader(
  document.querySelector<HTMLButtonElement>('#counter')!,
  document.querySelector<DotLottiePlayer>('#dotlottie-player')!,
  document.querySelector<HTMLButtonElement>('#next')!,
  document.querySelector<HTMLButtonElement>('#prev')!,
);
