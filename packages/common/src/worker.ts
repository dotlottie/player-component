import { Animation } from '@lottiefiles/lottie-types';
import { Manifest } from './dotlottie-player';
import { Dotlottie } from '@lottiefiles/dotlottie-js';

function response<T extends 'error' | 'data' = 'data'>(
  data: T extends 'error' ? string : { animations: Animation[]; manifest: Manifest; dl?: any },
) {
  if (typeof data === 'string') {
    self.postMessage({
      error: true,
      msg: data,
    });
    return;
  }
  self.postMessage({
    error: false,
    msg: '',
    animations: data.animations,
    manifest: data.manifest,
    dl: data.dl,
  });
}

self.addEventListener('message', async (message) => {
  const mess = message.data;

  const fileFormat = mess.split('.').pop()?.toLowerCase();

  if (fileFormat === 'json') {
    try {
      const data = await fetch(mess, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Response-Type': 'json',
        },
      }).then((response) => response.json());

      const animations: Animation[] = [];
      const filename = mess.substring(mess.lastIndexOf('/') + 1, mess.lastIndexOf('.'));

      const boilerplateManifest: Manifest = {
        animations: [
          {
            id: filename,
            speed: 1,
            loop: true,
            direction: 1,
          },
        ],
        description: '',
        author: '',
        keywords: '',
        generator: 'dotLottie-player-component',
        revision: 1,
        version: '1.0.0',
      };

      animations.push(data);

      response({
        animations: animations,
        manifest: boilerplateManifest,
      });
    } catch (error) {
      response<'error'>('[dotLottie]:json:fetch ' + error);
    }
    return;
  }

  /**
   * Now you're working with .lottie
   */

  try {
    const dl = new Dotlottie();
    const dotLottie = await dl.fromURL(mess);
    if (!dotLottie.animations?.length) {
      throw new Error('[dotLottie] No animation to load!');
    }
    const lottieAnimations = dotLottie.animations;
    if (!lottieAnimations.length) {
      throw new Error('[dotLottie] No animation to load!');
    }
    const animations: Animation[] = [];

    for (const anim of lottieAnimations) {
      const animation = await dotLottie.getAnimation(anim.id, {
        inlineAssets: true,
      });

      if (animation?.data) {
        animations.push(await animation.toJSON());
      }
    }

    response({
      animations,
      manifest: dotLottie.manifest as Manifest,
      dl: dotLottie,
    });
  } catch (error) {
    console.error('[dotLottie]: worker', error);
    response<'error'>('[dotLottie]: worker' + error);
  }
});

self.addEventListener('error', (errorMessage) => {
  console.error('[dotLottie]: worker', errorMessage);
  response<'error'>('[dotLottie]:worker ' + errorMessage);
});
