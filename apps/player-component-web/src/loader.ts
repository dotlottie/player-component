import { DotLottiePlayer, PlayMode } from '@dotlottie/player-component';

export function loader(
  element: HTMLButtonElement,
  player: DotLottiePlayer,
  nextButton: HTMLButtonElement,
  prevButton: HTMLButtonElement,
) {
  const setupLoader = () => {
    player.load(
      '/big-dotlottie.lottie',
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
