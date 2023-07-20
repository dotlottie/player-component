/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottiePlayer, PlayMode, PlaybackOptions } from '@dotlottie/player-component';

let loaded = false;

export function loader(
  element: HTMLButtonElement,
  player: DotLottiePlayer,
  nextButton: HTMLButtonElement,
  prevButton: HTMLButtonElement,
  explodingPigeon: HTMLButtonElement,
  smileyWifi: HTMLButtonElement,
  resetInteractivity: HTMLButtonElement,
  stateInput: HTMLInputElement,
  scroll: HTMLInputElement,
): void {
let isScrolling = false;

  const setupLoader = (): void => {
    player.load(
      'https://assets4.lottiefiles.com/packages/lf20_zyquagfl.json',
      {
        preserveAspectRatio: 'xMidYMid slice',
      },
      {
        playMode: PlayMode.Normal,
        loop: false,
      },
    );

    // player.enterInteractiveMode();
    // player.setSpeed(5);
  };

  element.addEventListener('click', (): void => setupLoader());

  nextButton.addEventListener('click', () =>
    player.next(),
  );

  prevButton.addEventListener('click', () => player.previous());
  
  scroll.addEventListener('click', () => {
    isScrolling = !isScrolling;

    if (isScrolling) {
    player.playOnScroll()} else {player.stopPlayOnScroll()}
  });

  explodingPigeon.addEventListener('click', () => player.enterInteractiveMode('exploding_pigeon'));
  
  smileyWifi.addEventListener('click', () => player.enterInteractiveMode('smiley_wifi'));
  
  resetInteractivity.addEventListener('click', () => player.reset());

  player.addEventListener('frame', (e) => {
    // console.log(e.detail.frame);
  });

  player.addEventListener('visibilityPercentage', (e) => {
    console.log('vp : ' + e);
  });

  player.addEventListener('ready', () => {
    console.log(player.getManifest());
    console.log(player.activeStateId)
    // player.setSpeed(5);
    // player.setDirection(-1);
    // player.setPlayMode('normal');
    if (!loaded) {
    loaded = true;

      player.getManifest().states?.forEach((state) => {
        let btn = document.createElement('button');
    
        btn.innerHTML = state;
        btn.type = 'button';
        // set style
        btn.style.cssText = "margin: 5px;"
    
        btn.addEventListener('click', () => {
          player.enterInteractiveMode(state)
          
          console.log(player.getState())
        });
        
        // append btn to container
        document.querySelector('.card')!.appendChild(btn);
      });
    }
  });
  console.log(player.getManifest());

}
