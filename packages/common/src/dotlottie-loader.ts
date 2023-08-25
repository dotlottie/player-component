/**
 * Copyright 2023 Design Barn Inc.
 */

import type { AnimationData } from '@dotlottie/dotlottie-js';
import {
  getTheme as getThemeUtil,
  getAnimation as getAnimationUtil,
  getManifest as getManifestUtil,
  loadFromArrayBuffer as loadFromArrayBufferUtil,
} from '@dotlottie/dotlottie-js';

import type { Manifest } from './dotlottie-player';
import { getFilename, isValidLottieJSON } from './utils';

export class DotLottieLoader {
  private _dotLottie?: Uint8Array;

  private readonly _animationsMap: Map<string, AnimationData> = new Map();

  private readonly _themeMap: Map<string, string> = new Map();

  private _manifest?: Manifest;

  public get dotLottie(): Uint8Array | undefined {
    return this._dotLottie;
  }

  public get animationsMap(): Map<string, AnimationData> {
    return this._animationsMap;
  }

  public get themeMap(): Map<string, string> {
    return this._themeMap;
  }

  public get manifest(): Manifest | undefined {
    return this._manifest;
  }

  public async loadFromUrl(url: string): Promise<void> {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to load dotLottie from ${url} with status ${response.status}`);
    }

    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      const json = await response.json();

      if (!isValidLottieJSON(json)) {
        throw new Error(`Invalid lottie JSON at ${url}`);
      }

      const animationId = getFilename(url);

      this._animationsMap.set(animationId, json as AnimationData);

      const tempManifest: Manifest = {
        activeAnimationId: animationId,
        animations: [
          {
            id: animationId,
          },
        ],
      };

      this._manifest = tempManifest;
    } else {
      this._dotLottie = await loadFromArrayBufferUtil(await response.arrayBuffer());

      const manifest = await getManifestUtil(this._dotLottie);

      if (!manifest) {
        throw new Error('Manifest not found');
      }

      this._manifest = manifest as Manifest;
    }
  }

  public loadFromLottieJSON(json: Record<string, unknown>): void {
    if (!isValidLottieJSON(json)) {
      throw new Error('Invalid lottie JSON');
    }

    const animationId = 'my-animation';

    this._animationsMap.set(animationId, json as unknown as AnimationData);

    const tempManifest: Manifest = {
      activeAnimationId: animationId,
      animations: [
        {
          id: animationId,
        },
      ],
    };

    this._manifest = tempManifest;
  }

  public async loadFromArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
    this._dotLottie = await loadFromArrayBufferUtil(arrayBuffer);

    const manifest = await getManifestUtil(this._dotLottie);

    if (!manifest) {
      throw new Error('Manifest not found');
    }

    this._manifest = manifest as Manifest;
  }

  public async getAnimation(animationId: string): Promise<AnimationData | undefined> {
    if (this._animationsMap.get(animationId)) {
      return this._animationsMap.get(animationId) as AnimationData;
    }

    if (!this._dotLottie) {
      return undefined;
    }

    const animation = await getAnimationUtil(this._dotLottie, animationId, { inlineAssets: true });

    if (animation) {
      this._animationsMap.set(animationId, animation);
    }

    return animation;
  }

  public async getTheme(themeId: string): Promise<string | undefined> {
    if (this._themeMap.get(themeId)) {
      return this._themeMap.get(themeId) as string;
    }

    if (!this._dotLottie) {
      return undefined;
    }

    const theme = await getThemeUtil(this._dotLottie, themeId);

    if (theme) {
      this._themeMap.set(themeId, theme);
    }

    return theme;
  }
}
