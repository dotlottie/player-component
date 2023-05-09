/**
 * Copyright 2023 Design Barn Inc.
 */

import { Dotlottie } from '@lottiefiles/dotlottie-js';
import type { Animation } from '@lottiefiles/lottie-types';
import { signal } from '@preact/signals-core';
import lottie from 'lottie-web';
import type {
  AnimationConfig,
  AnimationItem,
  AnimationEventName,
  RendererType,
  SVGRendererConfig,
  HTMLRendererConfig,
  CanvasRendererConfig,
} from 'lottie-web';

export enum PlayerState {
  Error = 'error',
  Fetching = 'fetching',
  Frozen = 'frozen',
  Initial = 'initial',
  Loading = 'loading',
  Paused = 'paused',
  Playing = 'playing',
  Ready = 'ready',
  Stopped = 'stopped',
}

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export interface Manifest {
  [key: string]: unknown;
  animations: Array<{
    [key: string]: unknown;
    direction: number;
    id: string;
    loop: boolean;
    mode?: 'normal' | 'bounce';
    speed: number;
  }>;
  author: string;
  description: string;
  generator: string;
  keywords: string;
  version: string;
}
export interface DotLottie {
  [key: string]: unknown;
  animations: {
    [key: string]: string;
  };
  images: {
    [key: string]: Uint8Array;
  };
  manifest: Manifest;
}

export interface DotLottieElement extends Element {
  __lottie?: AnimationItem | null;
}

export const EXTRA_OPTIONS = {
  count: 1,
  direction: 1 as 1 | -1,
  speed: 1,
  intermission: 1,
  mode: PlayMode.Normal,
};

export type ExtraOptions = typeof EXTRA_OPTIONS;
export type RendererSettings = SVGRendererConfig & CanvasRendererConfig & HTMLRendererConfig;
export type DotLottieConfig<T extends RendererType> = Omit<AnimationConfig<T>, 'container'> &
  ExtraOptions & {
    testId?: string | undefined;
  };

declare global {
  interface Window {
    dotLottiePlayer: Record<string, Record<string, unknown>>;
  }
}

export class DotLottiePlayer {
  protected _lottie?: AnimationItem;

  protected _src: string | Record<string, unknown>;

  protected _options: AnimationConfig<RendererType>;

  protected _extraOptions: ExtraOptions;

  protected _count: number = 0;

  protected _counter: number = 0;

  protected _intermission: number = 0;

  protected _counterInterv: number | null = null;

  protected _container: DotLottieElement;

  protected _name?: string;

  protected _mode: PlayMode = PlayMode.Normal;

  protected _animation: Animation | undefined;

  protected _animations: Animation[] = [];

  protected _manifest: Manifest | undefined = undefined;

  protected _testId?: string;

  protected _listeners = new Map();

  public state = signal<PlayerState>(PlayerState.Initial);

  public frame = signal<number>(0);

  public seeker = signal<number>(0);

  public constructor(
    src: string | Record<string, unknown>,
    container: DotLottieElement,
    options?: DotLottieConfig<RendererType>,
  ) {
    if (!(container instanceof Element)) {
      throw Error('Second parameter `container` expected to be an Element');
    }
    this._src = src;
    this._container = container;

    if (options?.testId) {
      this._testId = options.testId;
    }

    this._extraOptions = this._extractExtraOptions(options || ({} as DotLottieConfig<RendererType>));

    this.setCount(this._extraOptions.count);
    this.setIntermission(this._extraOptions.intermission);
    this.setMode(this._extraOptions.mode);

    this._options = {
      container,
      loop: false,
      autoplay: true,
      renderer: 'svg',
      rendererSettings: {
        clearCanvas: false,
        progressiveLoad: true,
        hideOnTransparent: true,
      },
      ...(options || {}),
    };
  }

  protected _extractExtraOptions(config: DotLottieConfig<RendererType>): ExtraOptions {
    return Object.entries(config).reduce((newConfig, [key, value]) => {
      if (!Object.hasOwn(EXTRA_OPTIONS, key)) return newConfig;

      return {
        ...newConfig,
        [key]: value,
      };
    }, EXTRA_OPTIONS);
  }

  protected _updateTestData(): void {
    if (!this._testId || !this._lottie) return;
    if (!window.dotLottiePlayer) {
      window.dotLottiePlayer = {
        [this._testId]: {},
      };
    }
    window.dotLottiePlayer[this._testId] = {
      direction: this._lottie.playDirection,
      currentState: this.state.value,
      loop: this.loop,
      mode: this._mode,
      speed: this._lottie.playSpeed,
    };
  }

  public get currentState(): PlayerState {
    return this.state.value;
  }

  protected clearCountTimer(): void {
    if (this._counterInterv) {
      clearInterval(this._counterInterv);
    }
  }

  protected setCurrentState(state: PlayerState): void {
    this.state.value = state;
    this._updateTestData();
  }

  public static isPathJSON(srcParsed: string): boolean {
    return srcParsed.split('.').pop()?.toLowerCase() === 'json';
  }

  public get src(): Record<string, unknown> | string {
    return this._src;
  }

  public updateSrc(src: Record<string, unknown> | string): void {
    if (this._src === src) return;
    this._src = src;
    this.load();
  }

  public get count(): number {
    return this._count;
  }

  public setCount(count: number): void {
    this._count = count;
  }

  public get intermission(): number {
    return this._intermission;
  }

  public setIntermission(intermission: number): void {
    this._intermission = intermission;
  }

  public get mode(): PlayMode {
    return this._mode;
  }

  public setMode(mode: PlayMode): void {
    this._mode = mode;
    this._updateTestData();
  }

  public goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void {
    if (!this._lottie) return;
    this._lottie.goToAndPlay(value, isFrame, name);
    this.setCurrentState(PlayerState.Playing);
  }

  public goToAndStop(value: number | string, isFrame?: boolean, name?: string): void {
    if (!this._lottie) return;
    this._lottie.goToAndStop(value, isFrame, name);
    this.setCurrentState(PlayerState.Stopped);
  }

  public play(): void {
    if (!this._lottie) return;

    if (this._lottie.playDirection === -1 && this._lottie.currentFrame === 0) {
      this._lottie.goToAndPlay(this._lottie.totalFrames, true);
    } else {
      this._lottie.play();
    }
    this.setCurrentState(PlayerState.Playing);
  }

  public resize(): void {
    if (!this._lottie) return;
    this._lottie.resize();
  }

  public stop(): void {
    if (!this._lottie) return;
    this._counter = 0;

    this.setDirection(this._extraOptions.direction);
    this._lottie.stop();
    this.setCurrentState(PlayerState.Stopped);
  }

  public pause(): void {
    if (!this._lottie) return;

    this.clearCountTimer();
    this._lottie.pause();
    this.setCurrentState(PlayerState.Paused);
  }

  public freeze(): void {
    if (!this._lottie) return;

    this._lottie.pause();
    this.setCurrentState(PlayerState.Frozen);
  }

  public destroy(): void {
    if (this._container.__lottie) {
      this._container.__lottie.destroy();
      this._container.__lottie = null;
    }

    this.clearCountTimer();
    this._lottie?.destroy();
  }

  public getAnimationInstance(): AnimationItem | undefined {
    return this._lottie;
  }

  public addEventListener(name: AnimationEventName, cb: () => unknown): void {
    this._listeners.set([name, cb], cb);
    try {
      this._lottie?.addEventListener(name, cb);
    } catch (error) {
      console.error('[dotLottie]:addEventListener', error);
    }
  }

  public get totalFrames(): number {
    return this._lottie?.totalFrames || 0;
  }

  public get direction(): 1 | -1 {
    if (!this._lottie) return 1;

    return this._lottie.playDirection as 1 | -1;
  }

  public setDirection(direction: 1 | -1): void {
    this._lottie?.setDirection(direction);
    this._extraOptions.direction = direction;
    this._updateTestData();
  }

  public get speed(): number {
    return this._lottie?.playSpeed || 1;
  }

  public setSpeed(speed: number): void {
    this._lottie?.setSpeed(speed);
    this._extraOptions.speed = speed;
    this._updateTestData();
  }

  public get autoplay(): boolean {
    return this._lottie?.autoplay ?? false;
  }

  public setAutoplay(value: boolean): void {
    if (!this._lottie) return;
    this._lottie.autoplay = value;
    this._updateTestData();
  }

  public toggleAutoplay(): void {
    if (!this._lottie) return;
    this.setAutoplay(!this._lottie.autoplay);
  }

  public get loop(): number | boolean {
    return this._lottie?.loop ?? false;
  }

  public setLoop(value: boolean): void {
    if (!this._lottie) return;
    this._lottie.setLoop(value);
    this._updateTestData();
  }

  public toggleLoop(): void {
    if (!this._lottie) return;
    this.setLoop(!this._lottie.loop);
  }

  public removeEventListener(name: AnimationEventName, cb?: () => unknown): void {
    try {
      if (cb) {
        this._lottie?.removeEventListener(name, cb);
      } else {
        this._lottie?.removeEventListener(name);
      }

      this._listeners.delete([name, cb]);
    } catch (error) {
      console.error('[dotLottie]:removeEventListener', error);
    }
  }

  public addEventListeners(): void {
    if (!this._lottie) return;
    this._lottie.addEventListener('enterFrame', () => {
      if (!this._lottie) return;
      this.frame.value = this._lottie.currentFrame;
      this.seeker.value = (this._lottie.currentFrame / this._lottie.totalFrames) * 100;
    });

    this._lottie.addEventListener('loopComplete', () => {
      if (this._lottie && this.loop && this._mode === PlayMode.Bounce) {
        const newDirection = (this._lottie.playDirection * -1) as 1 | -1;

        this._lottie.setDirection(newDirection);
        this._lottie.goToAndPlay(newDirection === -1 ? this._lottie.totalFrames - 1 : 0, true);
      }
    });

    this._lottie.addEventListener('complete', () => {
      if (this._lottie && !this.loop && this._count > 0) {
        this._counter += this._mode === PlayMode.Bounce ? 0.5 : 1;
        if (this._counter >= this._count) {
          this.stop();

          return;
        }

        this._counterInterv = setTimeout(() => {
          if (!this._lottie) return;

          let newDirection = this._lottie.playDirection;

          if (this._mode === PlayMode.Bounce) {
            newDirection = Number(newDirection) * -1;
          }

          const startFrame = newDirection === -1 ? this._lottie.totalFrames - 1 : 0;

          this._lottie.setDirection(newDirection as 1 | -1);
          this._lottie.goToAndPlay(startFrame, true);
        }, this._intermission);
      } else {
        this.stop();
        this.setCurrentState(PlayerState.Stopped);
      }
    });

    for (const [[name], cb] of this._listeners) {
      this._lottie.addEventListener(name, cb);
    }
  }

  public async load(): Promise<void> {
    if (this.state.value === PlayerState.Loading) {
      console.warn('[dotLottie] Loading inprogress..');

      return;
    }

    try {
      this.setCurrentState(PlayerState.Loading);

      const srcParsed = DotLottiePlayer.parseSrc(this._src);

      if (typeof srcParsed === 'string') {
        this._animation = await this.getAnimationData(srcParsed);
      } else if (DotLottiePlayer.isLottie(srcParsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._animation = srcParsed as any;
      } else {
        throw new Error('[dotLottie] Load method failing. Object is not a valid Lottie.');
      }

      /**
       * Animation is ready to render. Continuue
       */
      // Clear previous animation, if any
      this.destroy();

      // Initialize lottie player and load animation
      this._lottie = lottie.loadAnimation({
        ...this._options,
        animationData: this._animation,
      });

      this.addEventListeners();
      this._container.__lottie = this._lottie;
      this.setCurrentState(PlayerState.Ready);

      this.setDirection(this._extraOptions.direction);
      this.setSpeed(this._extraOptions.speed);

      if (this._options.autoplay) {
        this.play();
      }

      this._updateTestData();
    } catch (err) {
      this.setCurrentState(PlayerState.Error);
      console.log('err', err);
    }
  }

  protected setErrorState(msg: string): void {
    this.setCurrentState(PlayerState.Error);
    console.error(msg);
  }

  protected async fetchLottieJSON(src: string): Promise<{ animations: Animation[]; manifest: Manifest }> {
    if (!src.toLowerCase().endsWith('.json')) throw new Error('[dotlottie-player]: parameter src must be .json');

    try {
      const data = await fetch(src, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Response-Type': 'json',
        },
      }).then(async (resp) => resp.json());

      const animations: Animation[] = [];
      const filename = src.substring(Number(src.lastIndexOf('/')) + 1, src.lastIndexOf('.'));

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
        generator: 'dotLottie-player-common',
        revision: 1,
        version: '1.0.0',
      };

      animations.push(data);

      return {
        animations,
        manifest: boilerplateManifest,
      };
    } catch (error) {
      throw new Error(`[dotlottie-player]:fetchLottieJSON error  ${error}`);
    }
  }

  protected async getAnimationData(srcParsed: string): Promise<Animation> {
    if (srcParsed.toLowerCase().endsWith('.json')) {
      const { animations, manifest } = await this.fetchLottieJSON(srcParsed);

      if (!Array.isArray(animations) || animations.length === 0 || !animations[0]) {
        throw new Error('[dotLottie] No animation to load!');
      }

      this._manifest = manifest;
      this._animations = animations;

      return animations[0];
    }

    try {
      const dl = new Dotlottie();
      const dotLottie = await dl.fromURL(srcParsed);
      const lottieAnimations = dotLottie.animations;

      if (!lottieAnimations.length) {
        throw new Error('[dotLottie] No animation to load!');
      }
      const animations: Animation[] = [];

      for (const anim of lottieAnimations) {
        const animation = await dotLottie.getAnimation(anim.id, {
          inlineAssets: true,
        });

        if (animation) {
          animations.push(await animation.toJSON());
        }
      }

      if (!animations[0]) {
        throw new Error('[dotLottie] No animation to load!');
      }

      this._animations = animations;
      this._manifest = dotLottie.manifest as Manifest;

      return animations[0];
    } catch (error) {
      throw new Error(`[dotLottie]:getAnimationData error ${error}`);
    }
  }

  public static isLottie(json: Record<string, unknown>): boolean {
    const mandatory: string[] = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h'];

    return mandatory.every((field: string) => Object.prototype.hasOwnProperty.call(json, field));
  }

  public static parseSrc(src: string | Record<string, unknown>): string | Record<string, unknown> {
    if (typeof src === 'object') {
      return src;
    }

    try {
      return JSON.parse(src);
    } catch (error) {
      // Try construct an absolute URL from the src URL
      const srcUrl: URL = new URL(src, window.location.href);

      return srcUrl.toString();
    }
  }
}
