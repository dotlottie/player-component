/**
 * Copyright 2023 Design Barn Inc.
 */

import { Howl } from 'howler';

export interface DotLottieAudioOptions {
  src: string[];
}

export class DotLottieAudio {
  private readonly _howl: Howl;

  public constructor({ src }: DotLottieAudioOptions) {
    this._howl = new Howl({
      src,
    });
  }

  public play(): number {
    return this._howl.play();
  }

  public pause(): Howl {
    return this._howl.pause();
  }

  public playing(): boolean {
    return this._howl.playing();
  }

  public rate(): number {
    return this._howl.rate();
  }

  public seek(): number {
    return this._howl.seek();
  }

  public setVolume(): number {
    return this._howl.volume();
  }

  public unload(): void {
    this._howl.unload();
  }
}
