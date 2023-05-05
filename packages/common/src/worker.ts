/**
 * Copyright 2023 Design Barn Inc.
 */

import { Dotlottie } from '@lottiefiles/dotlottie-js';
import type { Animation } from '@lottiefiles/lottie-types';

import type { Manifest } from './dotlottie-player';

declare const self: Worker;

function response<T extends 'error' | 'data' = 'data'>(
  data: T extends 'error' ? string : { animations: Animation[]; manifest: Manifest },
): void {
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
  });
}

self.addEventListener('message', (message) => {
  const mess = message.data;

  const fileFormat = mess.split('.').pop()?.toLowerCase();

  (async (): Promise<void> => {
    if (fileFormat === 'json') {
      try {
        const data = await fetch(mess, {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Response-Type': 'json',
          },
        }).then(async (resp) => resp.json());

        const animations: Animation[] = [];
        const filename = mess.substring(Number(mess.lastIndexOf('/')) + 1, mess.lastIndexOf('.'));

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
          animations,
          manifest: boilerplateManifest,
        });
      } catch (error) {
        response<'error'>(`[dotLottie]:json:fetch ${error}`);
      }

      return;
    }

    /**
     * Now you're working with .lottie
     */

    try {
      const dl = new Dotlottie();
      const dotLottie = await dl.fromURL(mess);

      if (!dotLottie.animations.length) {
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
      });
    } catch (error) {
      console.error('[dotLottie]: worker', error);
      response<'error'>(`[dotLottie]: worker ${error}`);
    }
  })();
});

self.addEventListener('error', (errorMessage) => {
  console.error('[dotLottie]: worker', errorMessage);
  response<'error'>(`[dotLottie]:worker ${errorMessage}`);
});
