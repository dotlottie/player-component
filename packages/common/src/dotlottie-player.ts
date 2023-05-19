/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie } from '@dotlottie/dotlottie-js';
import type { Animation } from '@lottiefiles/lottie-types';
import { signal } from '@preact/signals-core';
import lottie from 'lottie-web';
import type {
  AnimationConfig,
  AnimationDirection,
  AnimationItem,
  AnimationEventName,
  RendererType,
  SVGRendererConfig,
  HTMLRendererConfig,
  CanvasRendererConfig,
} from 'lottie-web';

import { createError, logError, logWarning } from './utils';

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

export interface ManifestAnimation {
  autoplay?: boolean;
  direction?: AnimationDirection;
  hover?: boolean;
  id: string;
  intermission?: number;
  loop?: boolean | number;
  playMode?: PlayMode;
  speed?: number;
  themeColor?: string;
}

export type PlaybackOptions = Omit<ManifestAnimation, 'id'>;

export interface Manifest {
  activeAnimationId?: string;
  animations: ManifestAnimation[];
  author?: string;
  custom?: Record<string, unknown>;
  description?: string;
  generator?: string;
  keywords?: string;
  revision?: number;
  version?: string;
}

export interface DotLottieElement extends Element {
  __lottie?: AnimationItem | null;
}

export const DEFAULT_OPTIONS: PlaybackOptions = {
  autoplay: false,
  direction: 1,
  hover: false,
  intermission: 0,
  loop: false,
  playMode: PlayMode.Normal,
  speed: 1,
};

export type RendererSettings = SVGRendererConfig & CanvasRendererConfig & HTMLRendererConfig;
export type DotLottieConfig<T extends RendererType> = Omit<AnimationConfig<T>, 'container'> &
  PlaybackOptions & {
    activeAnimationId?: string | null;
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

  protected _playbackOptions: PlaybackOptions;

  protected _hover: boolean = false;

  protected _count: number = 0;

  protected _counter: number = 0;

  protected _intermission: number = 0;

  protected _counterInterval: number | null = null;

  protected _container: DotLottieElement;

  protected _name?: string;

  protected _mode: PlayMode = PlayMode.Normal;

  protected _animation: Animation | undefined;

  protected _animations: Map<string, Animation> = new Map();

  protected _manifest: Manifest | undefined = undefined;

  protected _activeAnimationId?: string | undefined;

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

    this._playbackOptions = this._validatePlaybackOptions(options || {});

    if (typeof options?.activeAnimationId === 'string') {
      this._activeAnimationId = options.activeAnimationId;
    }

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

    this._listenToHover();
  }

  protected _listenToHover(): void {
    const onEnter = (): void => {
      if (this._hover && this.currentState !== PlayerState.Playing) {
        this.play();
      }
    };
    const onLeave = (): void => {
      if (this._hover && this.currentState === PlayerState.Playing) {
        this.pause();
      }
    };

    this._container.removeEventListener('mouseenter', onEnter);
    this._container.removeEventListener('mouseleave', onLeave);

    this._container.addEventListener('mouseenter', onEnter);
    this._container.addEventListener('mouseleave', onLeave);
  }

  protected _getOption<T extends keyof Required<PlaybackOptions>, V extends Required<PlaybackOptions>[T]>(
    option: T,
  ): V {
    if (typeof this._playbackOptions[option] === 'undefined') {
      // Option from manifest
      const activeAnim = this._manifest?.animations.find((animation) => animation.id === this._activeAnimationId);

      if (activeAnim && activeAnim[option]) {
        return activeAnim[option] as unknown as V;
      }

      // Option from defaults
      return DEFAULT_OPTIONS[option] as V;
    }

    // Option from player props
    return this._playbackOptions[option] as V;
  }

  protected _updateTestData(): void {
    if (!this._testId || !this._lottie) return;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
    if (this._counterInterval) {
      clearInterval(this._counterInterval);
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
    this._activeAnimationId = undefined;
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

  public get hover(): boolean {
    return this.hover;
  }

  public setHover(hover: boolean): void {
    if (typeof hover !== 'boolean') return;
    this._hover = hover;
  }

  public setIntermission(intermission: number): void {
    this._intermission = intermission;
  }

  public get mode(): PlayMode {
    return this._mode;
  }

  public setMode(mode: PlayMode): void {
    if (typeof mode !== 'string') return;
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

  protected _validatePlaybackOptions(options?: Record<string, unknown>): Partial<PlaybackOptions> {
    if (!options) return {};
    const validatedOptions: Partial<PlaybackOptions> = {};

    for (const [key, value] of Object.entries(options)) {
      switch (key as keyof PlaybackOptions) {
        case 'autoplay':
          if (typeof value === 'boolean') {
            validatedOptions.autoplay = value;
          }
          break;

        case 'direction':
          if (typeof value === 'number' && [1, -1].includes(value)) {
            validatedOptions.direction = value as AnimationDirection;
          }
          break;

        case 'loop':
          if (typeof value === 'boolean' || typeof value === 'number') {
            validatedOptions.loop = value;
          }
          break;

        case 'playMode':
          if (typeof value === 'string' && ['normal', 'bounce'].includes(value)) {
            validatedOptions.playMode = value as PlayMode;
          }
          break;

        case 'speed':
          if (typeof value === 'number') {
            validatedOptions.speed = value;
          }
          break;

        case 'themeColor':
          if (typeof value === 'string') {
            validatedOptions.themeColor = value;
          }
          break;

        case 'hover':
          if (typeof value === 'boolean') {
            validatedOptions.hover = value;
          }
          break;

        case 'intermission':
          if (typeof value === 'number') {
            validatedOptions.intermission = value;
          }
          break;

        default:
          break;
      }
    }

    return validatedOptions;
  }

  public play(activeAnimation?: string | number, options?: PlaybackOptions): void {
    if (!this._lottie) return;

    if (!activeAnimation || (typeof activeAnimation === 'string' && activeAnimation === this._activeAnimationId)) {
      if (this._lottie.playDirection === -1 && this._lottie.currentFrame === 0) {
        this._lottie.goToAndPlay(this._lottie.totalFrames, true);
      } else {
        this._lottie.play();
      }
      this.setCurrentState(PlayerState.Playing);

      return;
    }

    if (typeof activeAnimation === 'number') {
      const anim = this._manifest?.animations[activeAnimation];

      if (!anim) {
        throw createError('animation not found.');
      }
      this.render(anim);
    }

    if (typeof activeAnimation === 'string') {
      const anim = this._manifest?.animations.find((animation) => animation.id === activeAnimation);

      if (!anim) {
        throw createError('animation not found.');
      }

      this.render({
        ...anim,
        ...this._validatePlaybackOptions(options),
      });
    }
  }

  public get activeAnimationId(): string | undefined {
    return this._activeAnimationId;
  }

  public reset(): void {
    const activeId = this._manifest?.activeAnimationId;

    if (!activeId) {
      const anim = this._manifest?.animations[0];

      if (!anim || !anim.id) {
        throw createError('animation not found.');
      }

      this.render(anim);
    }

    const anim = this._manifest?.animations.find((animation) => animation.id === activeId);

    if (!anim) return;

    this.render(anim);
  }

  public previous(options?: PlaybackOptions): void {
    if (!this._manifest || !this._manifest.animations.length) {
      throw createError('manifest not found.');
    }

    const currentIndex = this._manifest.animations.findIndex((anim) => anim.id === this._activeAnimationId);

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim =
      this._manifest.animations[
        (currentIndex - 1 + this._manifest.animations.length) % this._manifest.animations.length
      ];

    if (!nextAnim || !nextAnim.id) {
      throw createError('animation not found.');
    }

    this.render({
      ...nextAnim,
      ...this._validatePlaybackOptions(options),
    });
  }

  public next(options?: PlaybackOptions): void {
    if (!this._manifest || !this._manifest.animations.length) {
      throw createError('manifest not found.');
    }

    const currentIndex = this._manifest.animations.findIndex((anim) => anim.id === this._activeAnimationId);

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim = this._manifest.animations[(currentIndex + 1) % this._manifest.animations.length];

    if (!nextAnim || !nextAnim.id) {
      throw createError('animation not found.');
    }

    this.render({
      ...nextAnim,
      ...this._validatePlaybackOptions(options),
    });
  }

  public getManifest(): Manifest | undefined {
    return this._manifest;
  }

  public resize(): void {
    if (!this._lottie) return;
    this._lottie.resize();
  }

  public stop(): void {
    if (!this._lottie) return;
    this.clearCountTimer();
    this._counter = 0;

    this.setDirection(this._getOption('direction'));
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
    this._counter = 0;
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
      logError('[dotLottie]:addEventListener', error);
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
    if (typeof direction !== 'number') return;
    this._lottie?.setDirection(direction);
    this._playbackOptions.direction = direction;
    this._updateTestData();
  }

  public get speed(): number {
    return this._lottie?.playSpeed || 1;
  }

  public setSpeed(speed: number): void {
    if (typeof speed !== 'number') return;
    this._lottie?.setSpeed(speed);
    this._playbackOptions.speed = speed;
    this._updateTestData();
  }

  public get autoplay(): boolean {
    return this._lottie?.autoplay ?? false;
  }

  public setAutoplay(value: boolean): void {
    if (typeof value !== 'boolean') return;
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

  public setLoop(value: boolean | number): void {
    if (typeof value !== 'boolean' && typeof value !== 'number') return;
    if (!this._lottie) return;

    this.clearCountTimer();

    if (typeof value === 'number') {
      this._count = value;
    }

    this._lottie.setLoop(Boolean(value));
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
      logError('removeEventListener', error as string);
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

        this._counterInterval = setTimeout(() => {
          if (!this._lottie) return;

          let newDirection = this._lottie.playDirection;

          if (this._mode === PlayMode.Bounce && typeof newDirection === 'number') {
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

  protected render(activeAnimation?: Partial<ManifestAnimation>): void {
    if (activeAnimation?.id) {
      const anim = this._animations.get(activeAnimation.id);

      if (!anim) {
        throw createError('animation not found.');
      }
      this._activeAnimationId = activeAnimation.id;
      this._animation = anim;
    } else if (!this._animation) {
      throw createError('no animations selected.');
    }

    this.destroy();

    let shouldLoop = Boolean(this._getOption('loop'));

    // Number loops are handled within on `complete` event. not by lottie-web
    if (typeof activeAnimation?.loop === 'number') {
      shouldLoop = false;
    } else if (typeof activeAnimation?.loop === 'boolean') {
      shouldLoop = true;
    }

    const options = {
      ...this._options,
      autoplay: activeAnimation?.autoplay ?? this._getOption('autoplay'),
      loop: shouldLoop,
    };

    this.setMode(activeAnimation?.playMode ?? this._getOption('playMode'));
    this.setIntermission(activeAnimation?.intermission ?? this._getOption('intermission'));
    this.setHover(activeAnimation?.hover ?? this._getOption('hover'));
    this.setLoop(activeAnimation?.loop ?? this._getOption('loop'));

    this._lottie = lottie.loadAnimation({
      ...options,
      animationData: this._animation,
    });

    this.addEventListeners();
    this._container.__lottie = this._lottie;
    this.setCurrentState(PlayerState.Ready);

    this.setDirection(activeAnimation?.direction ?? this._getOption('direction'));
    this.setSpeed(activeAnimation?.speed ?? this._getOption('speed'));

    const shouldAutoPlay = activeAnimation?.autoplay ?? this._options.autoplay;

    if (shouldAutoPlay) {
      this.play();
    }

    this._updateTestData();
  }

  public async load(): Promise<void> {
    if (this.state.value === PlayerState.Loading) {
      logWarning('Loading inprogress..');

      return;
    }

    try {
      this.setCurrentState(PlayerState.Loading);

      const srcParsed = DotLottiePlayer.parseSrc(this._src);

      if (typeof srcParsed === 'string') {
        const { activeAnimationId, animations, manifest } = await this.getAnimationData(srcParsed);

        if (!this._activeAnimationId) {
          this._activeAnimationId = activeAnimationId;
        }

        this._animations = animations;
        this._manifest = manifest;

        const animation = this._animations.get(this._activeAnimationId);

        if (!animation) {
          throw createError(`invalid animation id ${this._activeAnimationId}`);
        }

        this._animation = animation;

        this.render();
      } else if (DotLottiePlayer.isLottie(srcParsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._animation = srcParsed as any;
        this.render();
      } else {
        throw createError('Load method failing. Object is not a valid Lottie.');
      }
    } catch (err) {
      this.setCurrentState(PlayerState.Error);
      logError('err', err);
    }
  }

  protected setErrorState(msg: string): void {
    this.setCurrentState(PlayerState.Error);
    logError(msg);
  }

  protected async fetchLottieJSON(src: string): Promise<{ animations: Map<string, Animation>; manifest: Manifest }> {
    if (!src.toLowerCase().endsWith('.json')) throw createError('parameter src must be .json');

    try {
      const data = await fetch(src, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Response-Type': 'json',
        },
      }).then(async (resp) => resp.json());

      const animations: Map<string, Animation> = new Map();
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

      animations.set(filename, data);

      return {
        animations,
        manifest: boilerplateManifest,
      };
    } catch (error) {
      throw createError(`fetchLottieJSON error  ${error}`);
    }
  }

  protected async getAnimationData(srcParsed: string): Promise<{
    activeAnimationId: string;
    animations: Map<string, Animation>;
    manifest: Manifest;
  }> {
    if (srcParsed.toLowerCase().endsWith('.json')) {
      const { animations, manifest } = await this.fetchLottieJSON(srcParsed);

      if (!animations.size || manifest.animations.length === 0 || !manifest.animations[0]) {
        throw createError('No animation to load!');
      }

      let activeAnimationId: string;

      if (manifest.activeAnimationId) {
        this._activeAnimationId = manifest.activeAnimationId;
        activeAnimationId = manifest.activeAnimationId;
      } else {
        this._activeAnimationId = manifest.animations[0].id;
        activeAnimationId = manifest.animations[0].id;
      }

      return {
        activeAnimationId,
        animations,
        manifest,
      };
    }

    try {
      const dl = new DotLottie();
      const dotLottie = await dl.fromURL(srcParsed);
      const lottieAnimations = dotLottie.animations;

      if (!lottieAnimations.length || !dotLottie.manifest.animations.length || !dotLottie.manifest.animations[0]) {
        throw createError('no animation to load!');
      }

      const animations: Map<string, Animation> = new Map();

      for (const anim of lottieAnimations) {
        const animation = await dotLottie.getAnimation(anim.id);

        if (animation) {
          animations.set(
            anim.id,
            await animation.toJSON({
              inlineAssets: true,
            }),
          );
        }
      }

      let activeAnimationId: string;

      if (dotLottie.manifest.activeAnimationId) {
        activeAnimationId = dotLottie.manifest.activeAnimationId;
      } else {
        activeAnimationId = dotLottie.manifest.animations[0].id;
      }

      if (!animations.size) {
        throw createError('no animation to load!');
      }

      return {
        activeAnimationId,
        animations,
        manifest: dotLottie.manifest as Manifest,
      };
    } catch (error) {
      throw createError(`getAnimationData error ${error}`);
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
