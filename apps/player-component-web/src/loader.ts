import { DotLottiePlayer, PlayMode } from '@dotlottie/player-component';

export function loader(
  element: HTMLButtonElement,
  player: DotLottiePlayer,
  nextButton: HTMLButtonElement,
  prevButton: HTMLButtonElement,
) {
  const setupLoader = () => {
    player.load(
      'https://lottie.host/c7029f2f-d015-4d88-93f6-7693bf88692b/d7j8UjWsGt.lottie',
      {
        preserveAspectRatio: 'xMidYMid slice',
      },
      {
        playMode: PlayMode.Normal,
        loop: false,
      },
    );

    // player.setSpeed(5);
  };
  element.addEventListener('click', () => setupLoader());

  nextButton.addEventListener('click', () =>
    player.next({
      loop: false,
      direction: -1,
      speed: 5,
    }),
  );

  prevButton.addEventListener('click', () => player.previous());

  player.addEventListener('ready', () => {
    console.log(player.getManifest());
    // player.setSpeed(5);
    // player.setDirection(-1);
    // player.setPlayMode('normal');
  });
}
