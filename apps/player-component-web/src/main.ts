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
      <button id="scroll" type="button">Activate scroll</button>

      <div style="width: 500px; height: 500px; margin: auto; justify-content: center">
<dotlottie-player src="/lf_interactivity_page.lottie" id="dotlottie-player" autoplay loop class="w-10 h-10"></dotlottie-player>
      </div>
    </div>
    <div class="card">
    <!--
    <dotlottie-player src="/car.lottie" id="car" activeStateId="start"></dotlottie-player>
    <dotlottie-player src="/pigeon.lottie" id="pigeon" activeStateId="exploding_pigeon"></dotlottie-player>
    <dotlottie-player src="/toggle.lottie" id="toggle" activeStateId="state_toggle"></dotlottie-player>
    <dotlottie-player src="/repeat.lottie" id="repeat" activeStateId="state_repeat"></dotlottie-player>
    <dotlottie-player src="/onComplete.lottie" id="onComplete" activeStateId="onComplete"></dotlottie-player>
-->

    <!--
    <dotlottie-player src="/onAfter.lottie" id="onAfter" activeStateId="onAfter"></dotlottie-player>
    <dotlottie-player src="/stateSegments.lottie" id="state_segments" activeStateId="state_segments"></dotlottie-player>
    <dotlottie-player src="/segmentsOnHover.lottie" id="loadInQueue" activeStateId="state_segments_on_hover"></dotlottie-player>
    <dotlottie-player src="/animationOnHover.lottie" id="animationOnHover" activeStateId="state_animation_on_hover"></dotlottie-player>
    <dotlottie-player src="/loadInQueue.lottie" id="loadInQueue" activeStateId="state_load_in_queue_1"></dotlottie-player>
    <dotlottie-player src="/mouseEnterLeave.lottie" id="mouseEnterLeave" activeStateId="mouseEnterMouseLeave"></dotlottie-player>
    -->

    <div style="height: 100vh"></div>
    <div style="width: 500px; height: 500px; margin: auto; justify-content: center">
      <!--<dotlottie-player id="dotlottie-player" controls src="https://assets5.lottiefiles.com/packages/lf20_FISfBK.json" autoplay loop class="w-10 h-10"></dotlottie-player>-->
      <dotlottie-player controls src="/lighthouseOnScroll.lottie" id="scroll-player" activeStateId="onShowTwo"></dotlottie-player>
      </div>
    <div style="height: 100vh"></div>
    </div>
  </div>
`;
// <dotlottie-player activeStateId="exploding_pigeon" src="/lf_interactivity_page.lottie" id="lf-player"></dotlottie-player>
   
// <dotlottie-player activeStateId="exploding_pigeon" src="/test_02_with_states.lottie" id="dotlottie-player" speed=1 playMode="normal" autoplay loop></dotlottie-player>

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
  document.querySelector<HTMLInputElement>('#state-input')!,
  document.querySelector<HTMLInputElement>('#scroll')!,
);
