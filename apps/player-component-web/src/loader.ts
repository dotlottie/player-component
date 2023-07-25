/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottiePlayer, PlayMode } from '@dotlottie/player-component';

export function loader(
  element: HTMLButtonElement,
  player: DotLottiePlayer,
  nextButton: HTMLButtonElement,
  prevButton: HTMLButtonElement,
  explodingPigeon: HTMLButtonElement,
  smileyWifi: HTMLButtonElement,
  resetInteractivity: HTMLButtonElement,
): void {
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
    player.next({
      loop: false,
      direction: -1,
      speed: 5,
    }),
  );

  prevButton.addEventListener('click', () => player.previous());

  explodingPigeon.addEventListener('click', () => player.setActiveStateId('exploding_pigeon'));
  smileyWifi.addEventListener('click', () => player.setActiveStateId('smiley_wifi'));
  resetInteractivity.addEventListener('click', () => player.setActiveStateId(''));

  player.addEventListener('ready', () => {
    console.log(player.getManifest());
    // player.setSpeed(5);
    // player.setDirection(-1);
    // player.setPlayMode('normal');
  });
}
