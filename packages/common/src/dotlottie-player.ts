import * as lottie from 'lottie-web';
import type {
  AnimationConfig,
  AnimationItem,
  AnimationEventName,
  RendererType,
  SVGRendererConfig,
  HTMLRendererConfig,
  CanvasRendererConfig,
} from 'lottie-web';
import { signal } from '@preact/signals-core';
import { Animation } from '@lottiefiles/lottie-types';
import WebWorker from 'web-worker:./worker.ts';

export enum PlayerState {
  Initial = 'initial',
  Fetching = 'fetching',
  Loading = 'loading',
  Ready = 'ready',
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
  Frozen = 'frozen',
  Error = 'error',
}

export enum PlayMode {
  Normal = 'normal',
  Bounce = 'bounce',
}

export interface Manifest {
  animations: {
    id: string;
    direction: number;
    loop: boolean;
    speed: number;
    mode?: 'normal' | 'bounce';
    [key: string]: unknown;
  }[];
  author: string;
  description: string;
  generator: string;
  keywords: string;
  version: string;
  [key: string]: unknown;
}
export interface DotLottie {
  animations: {
    [key: string]: string;
  };
  images: {
    [key: string]: Uint8Array;
  };
  manifest: Manifest;
  [key: string]: unknown;
}

export interface DotLottieElement extends Element {
  __lottie?: any;
}

export type RendererSettings = SVGRendererConfig & CanvasRendererConfig & HTMLRendererConfig;
export type DotLottieConfig<T extends RendererType> = Omit<AnimationConfig<T>, 'container'> & {
  mode?: PlayMode;
  testId?: string | undefined;
};

declare global {
  interface Window {
    dotLottiePlayer: any;
  }
}

export class DotLottiePlayer {
  protected _lottie?: AnimationItem;
  protected _src: string | Record<string, unknown>;
  protected _options: AnimationConfig<RendererType>;
  protected _container: DotLottieElement;
  protected _name?: string;
  protected _mode: PlayMode = PlayMode.Normal;
  protected _worker = new WebWorker();
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

    this.setMode(options?.mode || PlayMode.Normal);

    if (options?.testId) {
      this._testId = options.testId;
    }

    this._options = {
      container: container,
      loop: false,
      autoplay: true,
      renderer: 'svg',
      rendererSettings: {
        // scaleMode: 'noScale',
        clearCanvas: false,
        progressiveLoad: true,
        hideOnTransparent: true,
      },
      ...(options || {}),
    };
  }

  protected _updateTestData() {
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

  get currentState(): PlayerState {
    return this.state.value;
  }

  protected setCurrentState(state: PlayerState): void {
    this.state.value = state;
    this._updateTestData();
  }

  public static isPathJSON(srcParsed: string): boolean {
    return srcParsed.split('.').pop()?.toLowerCase() === 'json';
  }

  get src(): Record<string, unknown> | string {
    return this._src;
  }

  public updateSrc(src: Record<string, unknown> | string): void {
    if (this._src === src) return;
    this._src = src;
    this.load();
  }

  get mode(): PlayMode {
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

    if (this._lottie.currentFrame === 0 && !this.loop) {
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
    this._lottie.stop();
    this.setCurrentState(PlayerState.Stopped);
  }

  public pause(): void {
    if (!this._lottie) return;
    this._lottie.pause();
    this.setCurrentState(PlayerState.Paused);
  }

  public freeze(): void {
    if (!this._lottie) return;
    this._lottie.pause();
    this.setCurrentState(PlayerState.Frozen);
  }

  public destory(): void {
    if (this._container && this._container.__lottie) {
      this._container.__lottie.destroy();
      this._container.__lottie = null;
    }
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

  get totalFrames(): number {
    return this._lottie?.totalFrames || 0;
  }

  get direction(): 1 | -1 {
    return (this._lottie?.playDirection as 1 | -1) || 1;
  }

  public setDirection(direction: 1 | -1): void {
    this._lottie?.setDirection(direction);
    this._updateTestData();
  }

  get speed(): number {
    return this._lottie?.playSpeed || 1;
  }

  public setSpeed(speed: number): void {
    this._lottie?.setSpeed(speed);
    this._updateTestData();
  }

  get autoplay(): boolean {
    return this._lottie?.autoplay ?? false;
  }

  public setAutoplay(value: boolean) {
    if (!this._lottie) return;
    this._lottie.autoplay = value;
    this._updateTestData();
  }

  public toggleAutoplay() {
    if (!this._lottie) return;
    this.setAutoplay(!this._lottie.autoplay);
  }

  get loop(): number | boolean {
    return this._lottie?.loop ?? false;
  }

  public setLoop(value: boolean) {
    if (!this._lottie) return;
    this._lottie.setLoop(value);
    this._updateTestData();
  }

  public toggleLoop(): void {
    if (!this._lottie) return;
    this.setLoop(!this._lottie?.loop);
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
      this.frame.value = this._lottie?.currentFrame ?? 0;
      this.seeker.value =
        ((this._lottie?.currentFrame ?? 0) / (this._lottie?.totalFrames ?? 0)) * 100;
    });

    this._lottie.addEventListener('loopComplete', () => {
      if (this._lottie && this.loop && this._mode === PlayMode.Bounce) {
        const newDirection = (this._lottie.playDirection * -1) as 1 | -1;
        this.setDirection(newDirection);
        this._lottie.goToAndPlay(newDirection === -1 ? this._lottie.totalFrames - 1 : 0, true);
      }
    });

    this._lottie.addEventListener('complete', () => {
      this.setCurrentState(PlayerState.Stopped);
    });

    for (const [[name, _], v] of this._listeners) {
      this._lottie.addEventListener(name, v);
    }
  }

  public async load(): Promise<void> {
    if (this.state.value === PlayerState.Loading) {
      console.warn('[dotLottie] Loading inprogress..');
      return;
    }
    try {
      this.setCurrentState(PlayerState.Loading);

      let srcParsed = DotLottiePlayer.parseSrc(this._src);

      if (typeof srcParsed === 'string') {
        this._animation = await this.getAnimationData(srcParsed);
      } else if (DotLottiePlayer.isLottie(srcParsed)) {
        this._animation = srcParsed as any; // :/
      } else {
        throw new Error('[dotLottie] Load method failing. Object is not a valid Lottie.');
      }

      /**
       * Animation is ready to render. Continuue
       */
      // Clear previous animation, if any
      this.destory();

      // Initialize lottie player and load animation
      // @ts-ignore: Function does not exist :?
      this._lottie = lottie.loadAnimation({
        ...this._options,
        animationData: this._animation,
      });

      this.addEventListeners();

      if (this._container) {
        this._container.__lottie = this._lottie;
      }
      this.setCurrentState(PlayerState.Ready);

      if (this._options.autoplay) {
        this.play();
      }

      this._updateTestData();
    } catch (err) {
      this.setCurrentState(PlayerState.Error);
      console.log('err', err);
      return;
    }
  }

  protected setErrorState(msg: string) {
    this.setCurrentState(PlayerState.Error);
    console.error(msg);
  }

  protected async getAnimationData(srcParsed: string): Promise<Animation> {
    return new Promise((resolve, reject) => {
      // Adding one-time listeners
      this._worker.addEventListener(
        'message',
        async (message) => {
          const response = message.data as {
            error: boolean;
            msg: string;
            animations?: Animation[];
            manifest?: Manifest;
            dl: any;
          };

          if (response.error) {
            return reject(response.msg);
          }

          const animations = response.animations;
          const manifest = response.manifest;

          if (!animations || !animations.length) {
            return reject('[dotLottie] Animations are empty');
          }
          if (!manifest) {
            return reject('[dotLottie] Manifest empty');
          }

          this._animations = animations;
          this._manifest = manifest;

          // TODO: select the acitive animation
          const srcParsed = animations[0];
          if (srcParsed === undefined) {
            return reject('[dotLottie] No animation to load!');
          }
          return resolve(srcParsed);
        },
        { once: true },
      );

      this._worker.addEventListener(
        'error',
        (msg: any) => {
          reject(msg.data);
        },
        { once: true },
      );

      // Trigger
      this._worker.postMessage(srcParsed);
    });
  }

  public static isLottie(json: Record<string, any>): boolean {
    const mandatory: string[] = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h'];

    return mandatory.every((field: string) => Object.prototype.hasOwnProperty.call(json, field));
  }

  public static parseSrc(src: string | Record<string, unknown>): string | Record<string, unknown> {
    if (typeof src === 'object') {
      return src;
    }

    try {
      return JSON.parse(src);
    } catch (e) {
      // Try construct an absolute URL from the src URL
      const srcUrl: URL = new URL(src, window.location.href);

      return srcUrl.toString();
    }
  }
}
